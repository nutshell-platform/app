import React from 'react'

// Visual
import { Component, Container, Loading, Main } from '../../stateless/common/generic'
import Navigation from '../common/navigation'
import { UserCard } from '../../stateless/account/user-profile'
import ListUsers from '../../stateless/account/list-users'
import Background from '../../../../assets/undraw_texting_k35o.svg'

// Data
import { log, catcher, Dialogue } from '../../../modules/helpers'
import app from '../../../modules/firebase/app'

// Redux
import { connect } from 'react-redux'

class UserProfile extends Component {

	state = {
		handle: this.props.match.params.handle,
		filter: this.props.match.params.filter,
		profile: {}
	}

	componentDidMount = f => this.getUserByHandle()

	componentDidUpdate = async f => {

		const { handle, filter } = this.state
		const { handle: paramHandle, filter: paramFilter } = this.props.match.params
		if( handle != paramHandle ) {
			await this.updateState( { handle: paramHandle, loading: 'Finding user data' } )
			await this.getUserByHandle().catch( catcher )
		}
		if( filter != paramFilter ) await this.updateState( { filter: paramFilter } )

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

		const { profile, nutshells, loading, filter } = this.state
		const { draft, user } = this.props
		const noDraft = !( draft?.entries?.length > 0 )

		log( this.state )

		return <Container Background={ Background }>
			<Navigation title='Profile' />
			<Main.Top style={ { width: 500 } }>
				{ !filter && <UserCard loading={ loading } noDraft={ noDraft } nutshells={ nutshells } user={ profile } /> }
				{ !!filter && <ListUsers isSelf={ profile.uid == user.uid } username={ profile.name || profile.handle } users={ filter == 'followers' ? profile.followers : profile.following } filter={ filter } /> }
			</Main.Top>
		</Container>

	}

}

export default connect( store => ( {
	user: store.user,
	draft: store.nutshells?.draft
} ) )( UserProfile )
