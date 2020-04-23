import React from 'react'

// Visual
import { Component, Container, Loading, Main, Title } from '../../stateless/common/generic'
import Navigation from '../common/navigation'
import { ListResults } from '../../stateless/account/friends-find'

// Data
import { log } from '../../../modules/helpers'
import app from '../../../modules/firebase/app'

// Redux
import { connect } from 'react-redux'

class FindFriends extends Component {

	// initialise state
	state = {
		loading: 'Loading random people. Not randos though, nice people.',
		newFollows: [],
		newUnfollows: []
	}

	componentDidMount = async f => {
		const people = await app.getRandomPeople(  )
		return this.updateState( { results: people, loading: false } )
	}

	// Input handler
	onInput = ( key, value ) => this.updateState( { [key]: value } )

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

		const { results, newFollows, newUnfollows } = this.state
		const { following: oldFollows } = this.props.user
		const allFollows = [ ...oldFollows, ...newFollows ].filter( fuid => !newUnfollows.includes( fuid ) )

		const sortedResults = results.map( res => ( { ...res, following: allFollows.includes( res.uid ) } ) )
		console.log( sortedResults )
		return sortedResults.sort( ( a, b ) => {
			// Followed users go below
			if( a.following == b.following ) return 0
			if( a.following && !b.following ) return 1
			if( !a.following && b.following ) return -1
		} )


	}

	render() {

		const { loading } = this.state

		if( loading ) return <Loading message={ loading } />

		return <Container>
			<Navigation title='Find friends' />
			<Main.Top style={ { paddingTop: 20 } }>
				<Title>People on Nutshell</Title>
				<ListResults unfollow={ this.unfollow } follow={ this.follow } results={ this.sortedResults() } />
			</Main.Top>
		</Container>

	}

}

export default connect( store => ( {
	user: store.user
} ) )( FindFriends )