import React from 'react'

// Visual
import { Component, Container, Loading, Main } from '../../stateless/common/generic'
import Navigation from '../common/navigation'
import { UserCard } from '../../stateless/account/user-profile'

// Data
import { log, catcher } from '../../../modules/helpers'
import app from '../../../modules/firebase/app'

// Redux
import { connect } from 'react-redux'

class UserProfile extends Component {

	state = {
		loading: 'Finding user data',
		handle: this.props.match.params.handle,
		profile: {}
	}

	componentDidMount = async f => {

		const { handle } = this.state

		try {
			const profile = await app.getPerson( handle )
			const nutshells = await app.getNutshells( profile.uid )
			await this.updateState( { profile: profile, nutshells: nutshells, loading: false } )
		} catch( e ) {

			// Unable to find user
			const { history } = this.props 
			history.push( '/404' )
			
		}

	}

	followMan = ( following, setLocal ) => {

		const { profile } = this.state

		// Do the ( un )following but do not await the result
		if( following ) app.unfollowPerson( profile.uid )
		if( !following ) app.followPerson( profile.uid )

		// internal state of the pure component
		setLocal( !following )

	}

	render() {

		const { loading, handle, profile, nutshells } = this.state
		const { user } = this.props
		const following = user.following.includes( profile.uid )
		const isSelf = user?.uid == profile?.uid

		if( loading ) return <Loading message={ loading } />

		return <Container>
			<Navigation title={ `${handle}'s' profile` } />
			<Main.Top style={ { width: 500 } }>
				<UserCard nutshells={ nutshells } followMan={ this.followMan } isSelf={ isSelf } following={ following } user={ profile } />
			</Main.Top>
		</Container>

	}

}

export default connect( store => ( {
	user: store.user
} ) )( UserProfile )