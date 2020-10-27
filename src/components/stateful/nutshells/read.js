import React from 'react'

// Visual
import { Component, Container, Loading, Main, Link, Button } from '../../stateless/common/generic'
import Tutorial from '../onboarding/tutorial'
import FAB from '../common/fab'
import { Placeholder, NutshellCard, ViewRecs } from '../../stateless/nutshells/read'
import Navigation from '../common/navigation'
import People from '../../../../assets/undraw_people_tax5.svg'

// Data
import { log, Dialogue, wait } from '../../../modules/helpers'
import app from '../../../modules/firebase/app'

// Redux
import { connect } from 'react-redux'
import { updateOfflineInbox } from '../../../redux/actions/nutshellActions'

class ReadNutshell extends Component {

	// initialise state
	state = {
		loading: true,
		markedReadOffline: []
	}

	// Timeouted loading trackers
	loading = undefined
	inboxLoader = undefined

	// Load inbox
	loadInbox = async ( silent=false ) => {

		// Set loading tracker
		if( this.loading ) return

		// Offline checker
		if( !( await app.isOnline() ) ) return Promise.all( [
			Dialogue( 'You are offline', `We can't load any new data and any changes will not be saved.` ),
		] )

		try {

			log( 'Start nutshell loading' )
			this.loading = true
			if( !silent ) await this.updateState( { loading: true } )

			const { inbox, user, offlineInbox, dispatch } = this.props
			log( 'Load nutshells' )

			// Load nutshells, but with a minimum duration of 2 secs for UX
			const start = Date.now()

			// Find the nutshells in inbox that are not available offline
			const nutshellsToFetch = inbox.filter( uidInInbox => !offlineInbox.find( nutshell => nutshell.uid == uidInInbox ) )

			// Load those unavablable offline from remote
			let newNutshells = await Promise.all( nutshellsToFetch.map( uid => app.getNutshellByUid( uid ).catch( e => log( 'Error loading nutshell', uid, e ) ) ) )
			log( 'Loaded ', newNutshells, ' based on inbox ', inbox )

			// Update offline inbox based on new inbox data
			await dispatch( updateOfflineInbox( newNutshells, inbox ) )

			// If the loading process took shorter than a second, wait for 2 seconds
			if( Date.now() - start < 1000 ) await wait( 2000 )

			// If a nutshell is marked for deletion, remove it from the queue
			const markRead = newNutshells.filter( nutshell => nutshell.delete )

			// Delete nutshells that failed to load
			log( 'Mark read because of loading error: ', markRead )
			await Promise.all( markRead.map( nutshell => this.markRead( nutshell.delete ) ) ).catch( e => log( e ) )

		} catch( e ) {
			Dialogue( 'Something went wrong', e )
		} finally {
			log( 'Nutshell loading done, set loading tracker to false' )
			this.loading = false
			await this.updateState( { loading: false } )
		}
	}

	cleanNutshells = ( nutshells=[] ) => {

		const { user } = this.props
		const { markedReadOffline } = this.state

		if( user.muted?.length  ) nutshells = nutshells.filter( n => !user.muted.includes( n.uid ) )
		if( markedReadOffline?.length ) nutshells = nutshells.filter( n => !markedReadOffline.includes( n.uid ) )
	
		nutshells = nutshells.filter( n => !n.hidden )
		nutshells = nutshells.filter( n => !n.delete )
		

		// Sort with recent edits up top
		nutshells.sort( ( one, two ) => {
			if( one.updated > two.updated ) return 1
			if( one.updated < two.updated ) return -1
			return 0

		} )

		return nutshells
		
	}

	// Load Nutshells on mount
	componentDidMount = f => this.loadInbox()

	shouldComponentUpdate = async ( nextprops, nextstate ) => {
		const { inbox: remoteInbox, offlineInbox, user } = nextprops
		const { loading, markedReadOffline } = nextstate

		// If loading or no inbox, do nothing
		if( loading || this.loading || !remoteInbox ) return false

		// If remote inbox are more than local, get inbox details with a small delay
		if( remoteInbox?.length != offlineInbox?.length ) {
			if( this.inboxLoader ) clearTimeout( this.inboxLoader )
			// Trigger inbox load, but keep it silent if we are probably more current
			this.inboxLoader = setTimeout( f => this.loadInbox( !!markedReadOffline.length ), 2000 )
		}

		// Always trigger rerender ( default behavior )
		return true

	}

	// Input handler
	onInput = ( key, value ) => this.updateState( { [key]: value } )

	go = to => to && this.props.history.push( to )

	markRead = async uid => {

		// Track offline
		await this.updateState( { markedReadOffline: [ ...this.state.markedReadOffline, uid ] } )

		// Track online
		await app.markNutshellRead( uid )
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

		const { loading } = this.state
		const { user, history, draft, inbox, offlineInbox } = this.props
		const renderInbox = this.cleanNutshells( offlineInbox )


		return <Container Background={ People }>
			<Navigation title='Home' />
			<Main.Top>
				{ loading && <Button style={ { width: 500, marginBottom: 20, maxWidth: '100%' } } mode='flat' loading={ true }>Updating your inbox</Button> }
				<Tutorial />
				{ renderInbox?.length > 0 && renderInbox.map( nutshell => <NutshellCard isAdmin={ user.admin } deleteNutshell={ this.deleteNutshell } mute={ this.mute } report={ this.report } block={ this.block } markRead={ this.markRead } go={ this.go } key={ nutshell.uid } nutshell={ nutshell } /> ) }
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
	offlineInbox: store.nutshells.offline || [],
	draft: store.nutshells?.draft || {}
} ) )( ReadNutshell )
