import React from 'react'

// Visual
import { Component, Container, Loading, Main, Title, Search } from '../../stateless/common/generic'
import Navigation from '../common/navigation'
import { ListResults } from '../../stateless/account/friends-find'
import Friends from '../../../../assets/undraw_friends_online_klj6.svg'

// Data
import { log, catcher } from '../../../modules/helpers'
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
		filter: 'all'
	}

	componentDidMount = f => this.defaultSearch()

	// Input handler
	onInput = ( key, value ) => this.updateState( { [key]: value } )

	// Set random people as results
	defaultSearch = async f => {
		const people = await app.getRandomPeople(  )
		return this.updateState( { results: people, loading: false } )
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
		return Promise.all( [
			app.followPerson( uid ),
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
		const { following: oldFollows, muted } = this.props.user

		// Filter data
		const onlyUnmuted = muted?.length ? results.filter( ( { uid } ) => !muted.includes( uid ) ) : results
		const allFollows = [ ...oldFollows, ...newFollows ].filter( fuid => !newUnfollows.includes( fuid ) )

		
		const sortedResults = onlyUnmuted.map( res => ( { ...res, following: onlyUnmuted.includes( res.uid ) } ) )
		if( filter == 'all' ) return sortedResults
		// Disable sorting based on following status for now
		// .sort( ( a, b ) => {
		// 	// Followed users go below
		// 	if( a.following == b.following ) return 0
		// 	if( a.following && !b.following ) return 1
		// 	if( !a.following && b.following ) return -1
		// } )


	}

	render() {

		const { loading, query, searching } = this.state

		if( loading ) return <Loading message={ loading } />

		return <Container Background={ Friends }>
			<Navigation title='Friends' />
			<Main.Top style={ { width: 500 } }>
				<Search searching={ searching } onChangeText={ this.search } value={ query || '' } placeholder='Search by handle or email' />
				<ListResults unfollow={ this.unfollow } follow={ this.follow } results={ this.sortedResults() } />
			</Main.Top>
		</Container>

	}

}

export default connect( store => ( {
	user: store.user
} ) )( FindFriends )