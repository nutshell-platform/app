import React from 'react'

// Visual
import { Component, Container, Loading, Main } from '../../stateless/common/generic'
import Navigation from '../common/navigation'
import { UserCard } from '../../stateless/account/user-profile'
import Background from '../../../../assets/undraw_texting_k35o.svg'

// Data
import { log, catcher, Dialogue } from '../../../modules/helpers'
import app from '../../../modules/firebase/app'

// Redux
import { connect } from 'react-redux'

class UserProfile extends Component {

	state = {
		handle: this.props.match.params.handle,
		profile: {}
	}

	componentDidMount = f => this.getUserByHandle()

	componentDidUpdate = async f => {

		const { handle } = this.state
		const { handle: paramHandle } = this.props.match.params
		if( handle != paramHandle ) {
			await this.updateState( { handle: paramHandle, loading: 'Finding user data' } )
			await this.getUserByHandle().catch( catcher )
		}

	}

	getUserByHandle = async f => {
		const { handle } = this.state
		const { user } = this.props

		try {
			const profile = await app.getPerson( handle )

			// Get nutshells if needed and allowed
			let nutshells = []

			// If public profile of we follow them, load nutshells
			const iFollowTHem = user.following.includes( profile.uid )
			const thisIsMe = user.uid == profile.uid
			if( !profile.privateProfile || iFollowTHem || thisIsMe ) nutshells = await app.getNutshellsOfUser( profile.uid )
			else profile.accessDenied = true

			// Sort the Nutshells
			nutshells.sort( ( a, b ) => b.updated > a.updated ? 1 : -1 )

			// If we have muted items, filter them
			if( user.muted ) nutshells = nutshells.filter( n => !user.muted.includes( n.uid ) )

			await this.updateState( { profile: profile, nutshells: nutshells, loading: false } )

		} catch( e ) {

			catcher( 'Trouble getting user by handle: ', e )
			// Unable to find user
			const { history } = this.props
			history.push( '/404' )

		}
	}

	render() {

		const { profile, nutshells, loading } = this.state
		const { draft } = this.props
		const noDraft = !( draft?.entries?.length > 0 )

		return <Container Background={ Background }>
			<Navigation title='Profile' />
			<Main.Top style={ { width: 500 } }>
				<UserCard loading={ loading } noDraft={ noDraft } nutshells={ nutshells } user={ profile } />
			</Main.Top>
		</Container>

	}

}

export default connect( store => ( {
	user: store.user,
	draft: store.nutshells?.draft
} ) )( UserProfile )
