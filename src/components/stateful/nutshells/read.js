import React from 'react'

// Visual
import { Component, Container, Main, Button } from '../../stateless/common/generic'
import FAB from '../common/fab'
import { InboxTimeline, BottomTabs, ArchiveTimeline } from '../../stateless/nutshells/read'
import Navigation from '../common/navigation'
import People from '../../../../assets/undraw_people_tax5.svg'

// Data
import { log, Dialogue, wait, catcher } from '../../../modules/helpers'
import app from '../../../modules/firebase/app'
import { isWeb } from '../../../modules/apis/platform'

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
	loadInbox = async ( visualFeedback=true ) => {

		// Set loading tracker
		if( this.loading ) return

		// Offline checker
		if( !( await app.isOnline() ) ) return Promise.all( [
			Dialogue( 'You are offline', `We can't load any new data and any changes will not be saved.` ),
		] )

		try {

			log( 'Start nutshell loading' )
			this.loading = true
			if( visualFeedback ) await this.updateState( { loading: true } )

			const { inbox, offlineInbox, dispatch } = this.props
			if( inbox?.length != offlineInbox?.length ) log( 'Load nutshell discrepancy from: ', inbox, offlineInbox )

			// Load nutshells, but with a minimum duration of 2 secs for UX
			const start = Date.now()

			// Find the nutshells in inbox that are not available offline
			const nutshellsToFetch = inbox.filter( uidInInbox => !offlineInbox.find( nutshell => nutshell.uid == uidInInbox ) )

			// Load those unavablable offline from remote
			if( nutshellsToFetch.length ) log( 'Not available offline: ', nutshellsToFetch )
			let newNutshells = await Promise.all( nutshellsToFetch.map( uid => app.getNutshellByUid( uid ).catch( e => log( 'Error loading nutshell', uid, e ) ) ) )
			if( newNutshells.length ) log( 'Loaded ', newNutshells, ' based on inbox ', inbox )

			// Update offline inbox based on new inbox data
			await dispatch( updateOfflineInbox( newNutshells ) )

			// If the loading process took shorter than a second, wait for 2 seconds
			if( Date.now() - start < 1000 ) await wait( 2000 )

			// If a nutshell is marked for deletion, or is not in remote inbox, remove it from the queue
			const markRead = newNutshells?.filter( nutshell => nutshell.delete )

			// Delete nutshells that failed to load, first offline and then online in the background
			if( markRead?.length ) {

				log( 'Mark read because of loading error: ', markRead )

				// Add more to marked read offline
				await this.updateState( { markedReadOffline: [ ...this.state.markedReadOffline, ...markRead ] } )

				// Mark as read on remote
				await Promise.all( markRead.map( nutshell => app.markNutshellRead( nutshell.uid ) ) ).catch( e => log( e ) )

			}



		} catch( e ) {
			Dialogue( 'Something went wrong', e )
			catcher( e )
		} finally {
			log( 'Nutshell loading done, set loading tracker to false' )
			this.loading = false
			await this.updateState( { loading: false } )
		}
	}

	sortFormatAndCleanNutshells = (  ) => {

		const { user={}, inbox=[], offlineInbox=[] } = this.props
		const { markedReadOffline } = this.state

		// Grab the nutshell content based on the passed ids,
		let nutshells = inbox?.map( nutshellUid => offlineInbox.find( ( { uid } ) => uid == nutshellUid ) || false ).filter( exists => !!exists )

		if( user?.muted?.length  ) nutshells = nutshells.filter( n => !user?.muted.includes( n.uid ) )
		// log( 'Removed muted nutshells: ', nutshells )
		if( markedReadOffline?.length ) nutshells = nutshells.filter( n => !markedReadOffline.includes( n.uid ) )
		// log( 'Removed marked as read (offline): ', nutshells )

		nutshells = nutshells.filter( n => !n.hidden )
		// log( 'Removed hidden nutshells: ', nutshells )
		nutshells = nutshells.filter( n => !n.delete )
		// log( 'Remove deleted nutshells: ', nutshells )
		

		// Sort with recent edits up top
		nutshells = nutshells.sort( ( one, two ) => {
			if( one.updated > two.updated ) return -1
			if( one.updated < two.updated ) return 1
			return 0

		} )

		// log( 'Filtered/sorted nutshells: ', nutshells )

		return nutshells
		
	}

	// Load Nutshells on mount
	componentDidMount = f => this.loadInbox()

	shouldComponentUpdate = async ( nextprops, nextstate ) => {
		const { inbox: remoteInbox, offlineInbox, user } = nextprops
		const { loading, markedReadOffline } = nextstate

		// If loading or no inbox, do nothing
		if( loading || this.loading || !remoteInbox ) return false

		// If remote inbox has en entry the offline doesn't trigger load
		for ( let i = remoteInbox.length - 1; i >= 0; i-- ) {
			if( offlineInbox.find( ( { uid } ) => uid == remoteInbox[i] ) ) continue
			log( 'Scheduling inbox load because ', remoteInbox[i], ' is missing from ', offlineInbox )
			if( this.inboxLoader ) clearTimeout( this.inboxLoader )
			// Trigger inbox load, but keep it silent if we are probably more current
			this.inboxLoader = setTimeout( f => this.loadInbox( ) )
			return true
		}


		// Always trigger rerender ( default behavior )
		return true

	}

	handleScroll = ( { nativeEvent } ) => {
		const lazyLoadOffset = 200
		const height = nativeEvent.contentSize?.height
		const positionY = nativeEvent.contentOffset?.y + nativeEvent.layoutMeasurement?.height
		if( ( positionY + lazyLoadOffset ) > height ) return this.updateState( { endReached: true } )
		return this.updateState( { endReached: false } ) 
	}


	render() {

		const { loading, endReached } = this.state
		const { history, match } = this.props

		return <Container style={ { maxHeight: isWeb ? '100vh' : '100%' } } Background={ People }>
			<Navigation title={ match?.params?.filter || 'Inbox' } />
			<Main.Top scrollEventThrottle={ 0 } onScroll={ this.handleScroll } style={ { paddingBottom: 80, flexGrow: 0 } } refreshing={ loading } onRefresh={ this.loadInbox }>

				{ isWeb && loading && <Button style={ { width: 500, marginBottom: 20, maxWidth: '100%' } } mode='flat' loading={ true }>Updating your { match?.params?.filter || 'Inbox' }</Button> }
				{ match?.params?.filter == 'archive' && <ArchiveTimeline endReached={ endReached } /> }
				{ match?.params?.filter != 'archive' && <InboxTimeline renderInbox={ this.sortFormatAndCleanNutshells( ) } /> }

			</Main.Top>

			
			<BottomTabs current={ match?.params?.filter || 'inbox' } style={ { position: 'absolute', bottom: 0 } } />
			{ <FAB go={ to => history.push( to ) } /> }

		</Container>

	}

}

export default connect( store => ( {
	user: store.user,
	inbox: store.nutshells?.inbox || [],
	offlineInbox: store.nutshells?.offline || [],
	draft: store.nutshells?.draft || {}
} ) )( ReadNutshell )
