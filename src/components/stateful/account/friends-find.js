import React from 'react'

// Visual
import { Component, Container, Loading, Main, Title, Search } from '../../stateless/common/generic'
import Navigation from '../common/navigation'
import { ListResults, LinkContacts } from '../../stateless/account/friends-find'
import Friends from '../../../../assets/undraw_friends_online_klj6.svg'

// Data
import { log, catcher, Dialogue, wait } from '../../../modules/helpers'
import { isWeb } from '../../../modules/apis/platform'
import app from '../../../modules/firebase/app'


// Redux
import { connect } from 'react-redux'

class FindFriends extends Component {

	// initialise state
	state = {
		loading: 'Loading random people. Not randos though, nice people.',
		newFollows: [],
		newUnfollows: [],
		timeout: 1000,
		filter: 'all',
		results: [],
		recommendations: []
	}

	// Load default list
	componentDidMount = async f => {

		let { following, followers } = this.props.user

		try {

			// Load recommentations if they exist and exit if they do
			await this.loadRecommendations()
			const { results } = this.state 
			if( results.length != 0 ) return

			// If there are no recommendations, load the default search and trigger recommendation generation
			await Promise.all( [
				this.defaultSearch(),
				( following?.length || followers?.length ) && app.getContactRecommendations()
			] )

		} catch( e ) {
			alert( e )
		} finally {

			return this.updateState( { loading: false } )

		}

	}

	shouldComponentUpdate = async ( nextprops, nextstate ) => {

		// Check if new recommendations arrived
		const { recommendations: oldRecs } = this.props.user
		const { recommendations: newRecs } = nextprops.user

		// New data was added?
		if( ( !oldRecs && newRecs ) || ( oldRecs?.length < newRecs?.length ) ) Dialogue( '🕵️‍♀️ I found new friend recommendations!', 'Load them now?', [ { text: 'Yes, load them', onPress: this.loadRecommendations } ] )

		return true

	}


	// Input handler
	onInput = ( key, value ) => this.updateState( { [key]: value } )

	// Set random people as results
	defaultSearch = async f => {

		// Offline checker
		if( !( await app.isOnline() ) ) return Promise.all( [
			Dialogue( 'You are offline', `We can't load any new data and any changes will not be saved.` ),
			this.updateState( { loading: false } )
		] )

		const people = await app.getRandomPeople(  )
		return this.updateState( { results: people } )
	}

	// Load recommendation data
	loadRecommendations = async f => {

		const { recommendations } = this.props.user
		if( !recommendations ) return
		const people = await Promise.all( recommendations.map( uid => app.getPerson( uid, 'uid' ) ) )
		return this.updateState( { results: people } )

	}

	// Search manager interface
	search = query => {
		const { autoSearch, timeout, results } = this.state
		clearTimeout( autoSearch )

		if( query.length == 0 ) return Promise.all( [
			results.length == 0 && this.defaultSearch(),
			this.updateState( { query: undefined, searching: false } )
		] )
		return this.updateState( { query: query, searching: true, autoSearch: setTimeout( f => this.searchBackend( query ), timeout ) } )
	}

	// Searcher backend
	searchBackend = async query => {

		try {
			const results = await app.findPerson( query )
			return this.updateState( { results: results, searching: false } )
		} catch( e ) {
			catcher( e )
			alert( e )
		}

	}

	// Follow function
	follow = uid => { 
		const { newFollows, newUnfollows } = this.state
		const { user } = this.props

		return Promise.all( [
			app.followPerson( uid ),
			user?.recommendations?.includes( uid ) && app.unrecommendPerson( uid ),
			this.updateState( {
				newFollows: [ ...newFollows, uid ],
				newUnfollows: [ ...newUnfollows.filter( fuid => fuid != uid ) ]
			} )
		] )
	}

	unfollow = uid => {
		const { newFollows, newUnfollows } = this.state

		return Promise.all( [
			app.unfollowPerson( uid ),
			this.updateState( {
				newFollows: [ ...newFollows.filter( fuid => fuid != uid ) ],
				newUnfollows: [ ...newUnfollows, uid ]
			} )
		] )
	}

	// Split following vs not yet
	sortedResults = f => {

		// Grab data
		const { results, newFollows, newUnfollows, filter } = this.state
		const { following: oldFollows, blocked } = this.props.user

		// Filter data
		const onlyUnblocked = blocked?.length ? results.filter( ( { uid } ) => !blocked.includes( uid ) ) : results
		const allFollows = [ ...oldFollows, ...newFollows ].filter( fuid => !newUnfollows.includes( fuid ) )

		
		const sortedResults = onlyUnblocked.map( res => ( { ...res, following: allFollows.includes( res.uid ) } ) )
		if( filter == 'all' ) return sortedResults


	}

	linkContacts = async f => {

		try {

			await Dialogue( '🕵️‍♀️ Detective friendfinder', 'This will cross-reference your contact book with Nutshel users.' )
			await this.updateState( { loading: 'Sherlock is analysing your contacts...' } )
			const status = await Promise.race( [
				app.getAndSaveFingerprints(),
				wait( 5000 ).then( f => 'long' )
			] )

			if( status == 'long' ) {
				await this.updateState( { loading: 'Sherlock is slow today, no coffee this morning you see.' } )
				await wait( 5000 )
			}

		} catch( e ) {
			Dialogue( `Something went wrong with your contacts, sorry about that. Try again in a few minutes? We'll get some coffee.` )
			log( e )
		} finally {
			await this.updateState( { loading: false } )
			Dialogue( '🔥 All set!', `We are running our cross-referencing in the backgroud. You will be notified when we find a match.` )
		}

	}

	render() {

		const { loading, query, searching, recommendations } = this.state
		const { user } = this.props

		if( loading ) return <Loading message={ loading } />

		return <Container Background={ Friends }>
			<Navigation title='Friends' />
			<Main.Top style={ { width: 500 } }>

				<Search searching={ searching } onChangeText={ this.search } value={ query || '' } placeholder='Search by handle or email' />
				{ !isWeb && !user.contactBookSaved && <LinkContacts linkContacts={ this.linkContacts } /> }

				{ /* Search results */ }
				<ListResults unfollow={ this.unfollow } follow={ this.follow } results={ this.sortedResults() } />
			</Main.Top>
		</Container>

	}

}

export default connect( store => ( {
	user: store.user
} ) )( FindFriends )