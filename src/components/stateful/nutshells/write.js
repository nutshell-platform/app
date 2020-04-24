import React from 'react'

// Visual
import { Component, Container, Loading, Main } from '../../stateless/common/generic'
import { Editor } from '../../stateless/nutshells/write'
import Navigation from '../common/navigation'

// Data
import { log, getuid } from '../../../modules/helpers'
import app from '../../../modules/firebase/app'

// Redux
import { connect } from 'react-redux'

class WriteNutshell extends Component {

	// initialise state
	constructor( props ) {

		super( props )

		this.state = {
			loading: false,
			maxTitleLength: 75,
			maxParagraphLength: 2500,
			nutshell: {
				status: 'scheduled',
				entries: [],
				...props.nutshell
			},
			changesMade: false
		}

	}

	updateEntryInterface = async f => {
		// Get entries from nutshell and postpend a new one
		const { nutshell } = this.state
		let entries = [ ...nutshell.entries ]
		let updated = false


		// If the last entry has no emty space, add a new one
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

		if( updated ) return this.updateState( { nutshell: { ...nutshell, entries: entries } } )
	}
	// Set initial context
	componentDidMount = f => this.updateEntryInterface()
	componentDidUpdate = f => this.updateEntryInterface()

	// Input handler
	onInput = ( key, value ) => this.updateState( { [key]: value } )

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

		return this.updateState( { changesMade: true, nutshell: { ...nutshell, entries: [ ...updatedEntries ] } } )
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

		return inspirations[ inspirations.length * Math.random() | 0 ]
	}

	// Sumbit data to firebase
	saveDraft = async ( { type } ) => {

		const { nutshell } = this.state
		const { entries, scheduled, id } = nutshell

		// Validation
		// Only send entries with a title
		nutshell.entries = entries.filter( entry => entry.title.length > 0 )

		await this.updateState( { loading: 'Submitting your nutshell to the cloud. Weird how that goes.' } )

		// If hutshell already exists update it
		try {
			if( id ) await app.updateNutshell( nutshell )
			if( !id ) await app.createNutshell( nutshell )
			await this.updateState( { changesMade: false } )
		} catch( e ) {
			alert( e )
		} 

		await this.updateState( { loading: false } )

	}

	toggleStatus = f => {
		const { nutshell } = this.state
		const { status } = nutshell
		this.updateState( { changesMade: true, nutshell: { ...nutshell, status: status == 'draft' ? 'scheduled' : 'draft' } } )
	}

	render() {

		const { loading, nutshell, maxTitleLength, maxParagraphLength, changesMade } = this.state
		const { history, user, nutshell: originalNutshell, theme } = this.props

		if( loading ) return <Loading message={ loading } />

		return <Container>
			<Navigation title='Write your nutshell' />
			<Main.Center>
				<Editor inspire={ this.inspire } background={ theme.colors.background } changesMade={ changesMade } toggleStatus={ this.toggleStatus } saveDraft={ this.saveDraft } user={ user } status={ nutshell.status } entries={ nutshell.entries } updateEntry={ this.updateEntry } maxTitleLength={ maxTitleLength } maxParagraphLength={ maxParagraphLength } />
			</Main.Center>
		</Container>

	}

}

export default connect( store => ( {
	user: store.user || {},
	nutshell: store.nutshells?.draft || {},
	theme: store.settings.theme
} ) )( WriteNutshell )