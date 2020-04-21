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
		loading: 'Loading random people. Not randos though, nice people.'
	}

	componentDidMount = async f => {
		const people = await app.getRandomPeople(  )
		return this.updateState( { results: people, loading: false } )
	}

	// Input handler
	onInput = ( key, value ) => this.updateState( { [key]: value } )

	// Follow function
	follow = uid => alert( uid )

	render() {

		const { loading, results } = this.state
		const { user } = this.props

		if( loading ) return <Loading message={ loading } />

		return <Container>
			<Navigation title='Find friends' />
			<Main.Top style={ { paddingTop: 20 } }>
				<Title>People on Nutshell</Title>
				<ListResults follow={ this.follow } results={ results } />
			</Main.Top>
		</Container>

	}

}

export default connect( store => ( {
	user: store.user
} ) )( FindFriends )