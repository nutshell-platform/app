import React from 'react'

// Visual
import { Component, Container, Loading, Main, Profiler } from '../../stateless/common/generic'
import { Editor } from '../../stateless/nutshells/write'
import Navigation from '../common/navigation'
import Write from '../../../../assets/undraw_typewriter_i8xd.svg'

// Data
import { log, getuid, dateOfNext, Dialogue } from '../../../modules/helpers'
import app from '../../../modules/firebase/app'
import { isCI } from '../../../modules/apis/platform'


// Redux
import { connect } from 'react-redux'

class WriteNutshell extends Component {

	// initialise state
	constructor( props ) {

		super( props )

		this.state = {
			loading: false,
			autosaveInterval: 2000,
			maxTitleLength: 75,
			maxParagraphLength: 2500,
			nutshell: {
				status: 'scheduled',
				entries: [],
				...props.nutshell
			},
			unsavedChanges: false,
			tips: {
				cards: `You're typing a lot into one card! That is ok, but you might want to consider adding an extra card!\n\nScroll down to see the next card.`,
				offline: `You are offline. We can't load any new data and any changes will not be saved.`
			}
		}

	}

	updateEntryInterface = async f => {

		// Get entries from Nutshell and postpend a new one
		const { nutshell } = this.state
		let entries = [ ...nutshell.entries ]
		let updated = false


		// If the last entry has no empty space, add a new one
		const lastEntry = entries[ entries.length - 1 ]
		const lastEntryEmpty = lastEntry?.title?.length != 0 || !lastEntry?.paragraph?.length == 0
		if( entries.length == 0 || lastEntryEmpty ) {
			entries.push( { uid: await getuid(), title: '', paragraph: '' } )
			updated = true
		}

		// If there are more than two empty entries, remove one
		const empty = entries.map( ( entry, index ) => !entry.title.length && !entry.paragraph.length && index ).filter( entry => typeof entry == 'number' )
		if( empty.length > 1 ) {
			// Leave one empty one available
			empty.pop()

			// Remove entries whose index is in the empty list
			const updatedEntries = [ ...entries ].map( ( entry, index ) => empty.includes( index ) ? false : entry ).filter( entry => entry )

			// Set entries to the updated ones
			entries = updatedEntries
			updated = true
		}

		if( updated ) await this.updateState( { nutshell: { ...nutshell, entries: entries } } )


	}
	// Set initial context
	componentDidMount = f => {
		this.updateEntryInterface()
		this.saveDraft() // Save draft so we have a uid
	}
	componentDidUpdate = f => this.updateEntryInterface()

	// Input handler
	onInput = ( key, value ) => this.updateState( { [key]: value } )

	// Move card around
	moveCard = ( index, direction ) => {
		const { nutshell } = this.state
		const { entries } = nutshell

		// Ignore redundant requests
		if( index == 0 && direction == 'up' ) return log( 'Entry already at the top' )
		if( index == ( entries.length - 2 ) && direction == 'down' ) return log( 'Entry already at the bottom' )

		// Formulate new array with new order
		const swapIndex = direction == 'up' ? ( index - 1 ) : ( index + 1 )
		const swapEntry = { ...entries[ swapIndex ] }
		const entry = { ...entries[ index ] }

		log( `Swapping ${ index }`, entry )
		log( direction, `with ${ swapIndex }`, swapEntry )

		// Use splice to replace the entries
		const orderedEntries = [ ...entries ]

		// Take out one item at the place where the entry should go and put the entry there
		orderedEntries.splice( swapIndex, 1, entry )

		// Take out one item where the entry used to be and swap it with the replaced entry
		orderedEntries.splice( index, 1, swapEntry )

		this.scheduleAutosave()
		return this.updateState( { unsavedChanges: true, nutshell: { ...nutshell, entries: [ ...orderedEntries ] } } )

	}

	// Auto save scheduler
	scheduleAutosave = f => {

		if( this.scheduledAutosave ) {
			clearTimeout( this.scheduledAutosave )
			this.scheduledAutosave = undefined
		}

		this.scheduledAutosave = setTimeout( this.saveDraft, this.state.autosaveInterval )

	}

	// Handletips
	scheduleTipCheck = f => {

		if( this.scheduledTipCheck ) {
			clearTimeout( this.scheduledTipCheck )
			this.scheduledTipCheck = undefined
		}

		this.scheduledTipCheck = setTimeout( this.handleTips, this.state.autosaveInterval )

	}
	handleTips = async f => {

		const { nutshell: { entries }, tips } = this.state

		const longestEntry = [ ...entries ].sort( ( a, b ) => a.paragraph.length > b.paragraph.length )[0]

		// Tip about having multiple cards
		if( tips.cards && longestEntry.paragraph.length > 500 ) {
			const newTips = { ...tips }
			delete newTips.cards
			await this.updateState( { tips: newTips } )
			await Dialogue( 'Tip', tips.cards )
		}

		// Offline checker
		if( !( await app.isOnline() ) ) {
			const newTips = { ...tips }
			delete newTips.offline
			await this.updateState( { tips: newTips } )
			await Dialogue( 'You are offline', tips.offline )
		}

	}

	// Entry updates
	updateEntry = async ( uid, key, value ) => {

	
		const { nutshell, maxTitleLength, maxParagraphLength } = this.state
		const { entries } = nutshell

		// Validations/constraints
		if( key == 'title' && value.length > maxTitleLength ) return

		// Find the entry that needs to be updated and add changes
		const updatedEntry = entries.find( entry => entry.uid == uid )
		updatedEntry[ key ] = value
		const updatedEntries = [ ...entries ].map( entry => entry.uid == uid ? updatedEntry : entry )

		// Trigger autosave
		this.scheduleAutosave()
		this.scheduleTipCheck()


		await this.updateState( { unsavedChanges: uid, nutshell: { ...nutshell, entries: [ ...updatedEntries ] } } )


	}

	// Inspiration
	inspire = f => {		

		const inspirations = [
			`what are you struggling with?`,
			`what are you proud of?`,
			`what do you feel good about?`,
			`what are your plans?`,
			`what has changed in your life?`,
			`what are you relieved about?`,
			`what do you need help with?`,
			`what has been going well?`,
			`what is bothering you?`,
			`what have you been working on?`
		]

		// If we are in isCI test mode, the output needs to be predictable
		return inspirations[ isCI ? 0 : ( inspirations.length * Math.random() | 0 ) ]
	}

	// Sumbit data to firebase
	saveDraft = async f => {

		const { nutshell } = this.state
		const { entries, scheduled, uid } = nutshell

		// Validation
		// Only send entries with a title
		const updatedNutshell = {
			...nutshell,
			entries: entries.filter( entry => entry.title.length > 0 || entry.paragraph.length > 0 ),
			published: dateOfNext( 'monday' ).getTime()
		}

		// If Nutshell already exists update it
		try {
			log( `${ uid ? 'Updating' : 'Creating new' } nutshell: `, updatedNutshell )

			// Update existing Nutshell
			if( uid ) await app.updateNutshell( updatedNutshell )

			// Create new Nutshell
			if( !uid ) {
				const newNutshell = { ...updatedNutshell, uid: await getuid() }
				await Promise.all( [
					app.createNutshell( newNutshell ),
					this.updateState( { nutshell: newNutshell } )
				] )
			}

			// Set unsaved changes to false
			await this.updateState( { unsavedChanges: false } )

		} catch( e ) {
			alert( e )
		}

	}

	toggleStatus = f => {
		const { nutshell } = this.state
		const { status } = nutshell
		this.scheduleAutosave()
		this.updateState( { unsavedChanges: true, nutshell: { ...nutshell, status: status == 'draft' ? 'scheduled' : 'draft' } } )
	}

	render() {

		const { loading, nutshell, maxTitleLength, maxParagraphLength, unsavedChanges } = this.state
		const { history, user, nutshell: originalNutshell, theme } = this.props

		if( loading ) return <Loading message={ loading } />

		return <Container Background={ Write }>
			<Navigation title='Write' />
			<Main.Center>
				<Editor
					moveCard={ this.moveCard  }
					inspire={ this.inspire }
					background={ theme.colors.background }
					unsavedChanges={ unsavedChanges }
					toggleStatus={ this.toggleStatus }
					saveDraft={ this.saveDraft  }
					user={ user }
					status={ nutshell.status }
					entries={ nutshell.entries }
					updateEntry={ this.updateEntry  }
					maxTitleLength={ maxTitleLength }
					maxParagraphLength={ maxParagraphLength }
				/>
			</Main.Center>
		</Container>

	}

}

export default connect( store => ( {
	user: store.user || {},
	nutshell: store.nutshells?.draft || {},
	theme: store.settings?.theme
} ) )( WriteNutshell )
