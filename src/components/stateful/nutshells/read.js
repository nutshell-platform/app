import React from 'react'

// Visual
import { Component, Container, Loading, Main, Link, Button } from '../../stateless/common/generic'
import Tutorial from '../onboarding/tutorial'
import FAB from '../common/fab'
import { Placeholder, NutshellCard, ViewRecs } from '../../stateless/nutshells/read'
import Navigation from '../common/navigation'
import People from '../../../../assets/undraw_people_tax5.svg'

// Data
import { log, Dialogue } from '../../../modules/helpers'
import app from '../../../modules/firebase/app'

// Redux
import { connect } from 'react-redux'

class ReadNutshell extends Component {

	// initialise state
	state = {
		inbox: [ ...( this.props.nutshells?.inbox || [] ) ],
		rawInbox: undefined
	}

	loading = false
	inboxLoader = undefined

	// Load inbox
	loadInbox = async f => {

		if( this.loading ) return

		// Offline checker
		if( !( await app.isOnline() ) ) return Promise.all( [
			Dialogue( 'You are offline', `We can't load any new data and any changes will not be saved.` ),
		] )

		try {

			this.loading = true

			const { inbox, user } = this.props
			log( 'Load nutshells' )
			let nutshells = await Promise.all( inbox.map( uid => app.getNutshellByUid( uid ).catch( f => ( { delete: uid } ) ) ) )
			const markRead = nutshells.filter( nutshell => nutshell.delete )

			log( 'Filter nutshells', nutshells )
			// Filter out Nutshells that failed to load ( e.g. has been deleted )
			nutshells = nutshells.filter( nutshell => !nutshell.delete )

			log( 'Update state with filtered nutshells: ', this.cleanNutshells( nutshells, user.muted ) )
			// Filter out censored and set to state
			await this.updateState( {
				rawInbox: nutshells,
				inbox: this.cleanNutshells( nutshells, user.muted )
			} )

			// Delete nutshells that failed to load
			log( 'Mark read because of loading error: ', markRead )
			await Promise.all( markRead.map( nutshell => this.markRead( nutshell.delete ) ) ).catch( e => log( e ) )

		} catch( e ) {
			Dialogue( 'Something went wrong', e )
		} finally {
			this.loading = false
		}
	}

	cleanNutshells = ( nutshells=[], muted=[] ) => nutshells.filter( n => !muted.includes( n.uid ) ).filter( n => !n.hidden )

	// Load Nutshells on mount
	componentDidMount = f => this.loadInbox()

	shouldComponentUpdate = async ( nextprops, nextstate ) => {
		const { inbox: externalInbox, user } = nextprops
		const { rawInbox: internalInbox, loading } = nextstate

		// If loading or no followers, do nothing
		if( loading || !externalInbox ) return false

		// If remote followers are more than local, get follower details with a small delay
		if( externalInbox.length != internalInbox.length ) {
			if( this.inboxLoader ) clearTimeout( this.inboxLoader )
			this.inboxLoader = setTimeout( this.loadInbox, 2000 )
		}

		// Always trigger rerender ( default behavior )
		return true

	}

	// Input handler
	onInput = ( key, value ) => this.updateState( { [key]: value } )

	go = to => to && this.props.history.push( to )

	markRead = async uid => {
		await app.markNutshellRead( uid )
		const { inbox: oldInbox } = this.state
		const newInbox = [ ...oldInbox.filter( item => item.uid != uid ) ]
		await this.updateState( { inbox: newInbox } )
	}


	block = ( userUid, nutshellUid ) => Promise.all( [
		app.markNutshellRead( nutshellUid ),
		app.unfollowPerson( userUid ),
		app.blockPerson( userUid )
	] )

	mute = nutshellUid => Promise.all( [
		app.markNutshellRead( nutshellUid ),
		app.muteNutshell( nutshellUid ),
		// Filter out the blocked onw from current state
		this.updateState( { inbox: this.state.inbox.filter( ( { uid } ) => uid != nutshellUid ) } )
	] )

	report = async nutshellUid => this.props.history.push( `/nutshells/report/${nutshellUid}` )

	deleteNutshell = uidToDelete => Dialogue(
		'⚠️ Confirm deletion',
		'Are you sure you want to delete this nutshell?',
		[
			{ text: 'Yes', onPress: f => Promise.all( [
				app.deleteNutshell( uidToDelete ),
				// Filter out the blocked onw from current state
				this.updateState( { inbox: this.state.inbox.filter( ( { uid } ) => uid != uidToDelete ) } )
			] ) },
			{ text: 'No, keep nutshell' }
		]
	)

	render() {

		const { loading, inbox, rawInbox } = this.state
		const { user, history, draft } = this.props

		return <Container Background={ People }>
			<Navigation title='Home' />
			<Main.Top>
				{ !rawInbox && <Button style={ { width: '90%', marginBottom: 20 } } mode='flat' loading={ true }>Loading your inbox</Button> }
				<Tutorial />
				{ inbox?.length > 0 && inbox.map( nutshell => <NutshellCard isAdmin={ user.admin } deleteNutshell={ this.deleteNutshell } mute={ this.mute } report={ this.report } block={ this.block } markRead={ this.markRead } go={ this.go } key={ nutshell.uid } nutshell={ nutshell } /> ) }
				<ViewRecs recAmount={ user.recommendations?.length } />
				{ inbox.length == 0 && <Placeholder status={ draft.status } hasDraft={ draft.entries?.length != 0 } /> }

			</Main.Top>

			<FAB go={ to => history.push( to ) } />
		</Container>

	}

}

export default connect( store => ( {
	user: store.user,
	inbox: store.nutshells.inbox || [],
	draft: store.nutshells?.draft
} ) )( ReadNutshell )
