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

class ManageFriends extends Component {

	// initialise state
	state = {
		loading: false,
		timeout: 1000,
		newFollows: [],
		newUnfollows: [],
		results: []
	}

	loadFollowerDetails = async f => {
		const { loading } = this.state 
		if( loading ) return
		await this.updateState( { loading: 'Loading your friend details' } )
		const { following } = this.props.user
		const friends = await Promise.all( following.map( uid => app.getPerson( uid, 'uid' ) ) )
		return this.updateState( { results: friends, loading: false } )
	}

	componentDidMount = async f => this.loadFollowerDetails()

	shouldComponentUpdate = async ( nextprops, nextstate ) => {
		const { followers } = nextprops.user
		const { results, loading } = nextstate

		// If loading or no followers, do nothing
		if( loading || !followers ) return false

		// If remote followers are more than local, get follower details
		return true
	}

	// Input handler
	onInput = ( key, value ) => this.updateState( { [key]: value } )

	// Search manager interface
	search = query => {
		const { autoSearch, timeout, results } = this.state
		clearTimeout( autoSearch )

		if( query.length == 0 ) return Promise.all( [
			results.length == 0 && this.defaultSearch(),
			this.updateState( { query: undefined, searching: false } )
		] ).catch( catcher )
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
		] ).catch( catcher )
	}

	unfollow = uid => {
		const { newFollows, newUnfollows } = this.state

		return Promise.all( [
			app.unfollowPerson( uid ),
			this.updateState( {
				newFollows: [ ...newFollows.filter( fuid => fuid != uid ) ],
				newUnfollows: [ ...newUnfollows, uid ]
			} )
		] ).catch( catcher )
	}

	// Split following vs not yet
	sortedResults = f => {

		const { results, newFollows, newUnfollows, filter } = this.state
		const { following: oldFollows } = this.props.user
		const allFollows = [ ...oldFollows, ...newFollows ].filter( fuid => !newUnfollows.includes( fuid ) )
		return results.map( res => ( { ...res, following: allFollows.includes( res.uid ) } ) )


	}

	render() {

		log( 'Friends state: ', this.state )

		const { loading, query, searching } = this.state

		if( loading ) return <Loading message={ loading } />

		return <Container Background={ Friends }>
			<Navigation title='Friends' />
			<Main.Top style={ { width: 500 } }>
				<Search nativeID='friends-manage-search' searching={ searching } onChangeText={ this.search } value={ query || '' } placeholder='Search by handle or email' />
				<ListResults unfollow={ this.unfollow } follow={ this.follow } results={ this.sortedResults() } filter='friends' />
			</Main.Top>
		</Container>

	}

}

export default connect( store => ( {
	user: store.user || {}
} ) )( ManageFriends )