import React from 'react'

// Visual
import { Component, Container, Loading, Main } from '../../stateless/common/generic'
import Navigation from '../common/navigation'
import { UserCard } from '../../stateless/account/user-profile'
import Background from '../../../../assets/undraw_texting_k35o.svg'

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

	componentDidMount = f => this.getUserByHandle()

	componentDidUpdate = async f => {

		const { handle } = this.state 
		const { handle: paramHandle } = this.props.match.params
		if( handle != paramHandle ) {
			await this.updateState( { handle: paramHandle, loading: 'Finding user data' } )
			await this.getUserByHandle()
		}

	}

	getUserByHandle = async f => {
		const { handle } = this.state
		const { user } = this.props

		try {
			const profile = await app.getPerson( handle )
			let nutshells = await app.getNutshellsOfUser( profile.uid )

			// If we have muted items, filter them
			if( user.muted ) nutshells = nutshells.filter( n => !user.muted.includes( n.uid ) )

			await this.updateState( { profile: profile, nutshells: nutshells, loading: false } )

		} catch( e ) {

			log( e )
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

	blockPerson = theirUid => Promise.all( [
		app.unfollowPerson( theirUid ),
		app.blockPerson( theirUid )
	] )

	unblockPerson = theirUid => app.unblockPerson( theirUid )

	mute = nutshellUid => Promise.all( [
		app.markNutshellRead( nutshellUid ),
		app.muteNutshell( nutshellUid ),
		// Filter out the blocked onw from current state
		this.updateState( { nutshells: this.state.nutshells.filter( ( { uid } ) => uid != nutshellUid ) } )
	] )

	render() {

		const { loading, handle, profile, nutshells } = this.state
		const { user, draft } = this.props
		const following = user.following?.includes( profile.uid )
		const isSelf = user?.uid == profile?.uid
		const noDraft = !( draft?.entries?.length > 0 )
		const blocked = user.blocked?.includes( profile.uid )


		if( loading ) return <Loading message={ loading } />

		return <Container Background={ Background }>
			<Navigation title='Profile' />
			<Main.Top style={ { width: 500 } }>
				<UserCard mute={ this.mute } blocked={ blocked } unblockPerson={ this.unblockPerson } blockPerson={ !isSelf && this.blockPerson } noDraft={ noDraft } nutshells={ nutshells } followMan={ this.followMan } isSelf={ isSelf } following={ following } user={ profile } />
			</Main.Top>
		</Container>

	}

}

export default connect( store => ( {
	user: store.user,
	draft: store.nutshells.draft
} ) )( UserProfile )