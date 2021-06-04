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
		loading: true,
		newFollows: [],
		newUnfollows: [],
		timeout: 1000,
		filter: 'all',
		results: [],
		recommendations: [ ...( this.props.user?.recommendations ? this.props.user?.recommendations : [] ) ]
	}

	// Load default list
	componentDidMount = async f => {

		let { following, followers } = this.props.user

		try {

			// Trigger reccs in the background
			this.loadRecommendations() // is async

			// If not followers or not following anyone, get recommendations
			if( ( following?.length || followers?.length ) ) app.getContactRecommendations() // is Async

			// Load the default search in a blocking fashion
			await this.defaultSearch()


		} catch( e ) {
			catcher( e )
			alert( e )
		} finally {

			await this.updateState( { loading: false } )

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

		try {

			log( 'Triggering default search' )

			// Offline checker
			if( !( await app.isOnline() ) ) return Promise.all( [
				Dialogue( 'You are offline', `We can't load any new data and any changes will not be saved.` ),
				this.updateState( { loading: false } )
			] )

			const people = await app.getRandomPeople(  )
			log( 'defaultSearch found ', people )
			return this.updateState( { results: people, filter: 'all' } )

		} catch( e ) {
			catcher( e )
		}
	}

	// Load recommendation data
	loadRecommendations = async f => {

		const { recommendations } = this.props.user
		if( !recommendations ) return
		const people = await Promise.all( recommendations.map( uid => app.getPerson( uid, 'uid' ) ) ).catch( catcher )
		return this.updateState( { recommendedProfiles: people } )

	}

	// Search manager interface
	search = query => {
		const { autoSearch, timeout, results } = this.state
		clearTimeout( autoSearch )

		if( query.length == 0 ) return Promise.all( [
			results.length == 0 && this.defaultSearch(),
			this.updateState( { filter: 'all', query: undefined, searching: false } )
		] ).catch( catcher )

		return this.updateState( { filter: 'search', query: query, searching: true, autoSearch: setTimeout( f => this.searchBackend( query ), timeout ) } )
	}

	// Searcher backend
	searchBackend = async query => {

		try {
			const results = await app.findPerson( query )
			return this.updateState( { results: results, filter: results?.length ? 'search' : 'all', searching: false } )
		} catch( e ) {
			catcher( e )
			alert( e )
		}

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
			catcher( e )
		} finally {
			await this.updateState( { loading: false } )
			Dialogue( '🔥 All set!', `We are running our cross-referencing in the backgroud. You will be notified when we find a match.` )
		}

	}

	render() {

		const { loading, query, searching, filter, recommendedProfiles,results } = this.state
		const { user } = this.props

		return <Container Background={ Friends }>
			<Navigation title='Friends' />
			<Main.Top style={ { width: 500 } }>

				<Search searching={ searching } onChangeText={ this.search } value={ query || '' } placeholder='Search by handle or email' />
				{ !isWeb && !user.contactBookSaved && <LinkContacts linkContacts={ this.linkContacts } /> }

				{ /* Search results */ }
				<ListResults loading={ loading } filter={ filter } results={ results } recommendedProfiles={ recommendedProfiles } />
			</Main.Top>
		</Container>

	}

}

export default connect( store => ( {
	user: store.user
} ) )( FindFriends )