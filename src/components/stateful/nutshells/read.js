import React from 'react'

// Visual
import { Component, Container, Loading, Main, Link } from '../../stateless/common/generic'
import Tutorial from '../onboarding/tutorial'
import { Placeholder, NutshellCard } from '../../stateless/nutshells/read'
import Navigation from '../common/navigation'
import People from '../../../../assets/undraw_people_tax5.svg'

// Data
import { log } from '../../../modules/helpers'
import app from '../../../modules/firebase/app'

// Redux
import { connect } from 'react-redux'

class ReadNutshell extends Component {

	// initialise state
	state = {
		loading: 'Checking your nutshell inbox'
	}

	// Load inbox
	loadInbox = async f => {
		try {
			const { inbox } = this.props
			const nutshells = await Promise.all( inbox.map( uid => app.getNutshellByUid( uid ) ) )

			// Filter  out censored and set to state
			await this.updateState( { inbox: nutshells.filter( n => !n.hidden ), loading: false } )

		} catch( e ) {
			alert( e )
		}
	}

	// Load nutshells on mount
	componentDidMount = f => this.loadInbox()

	shouldComponentUpdate = async ( nextprops, nextstate ) => {
		const { inbox: externalInbox } = nextprops
		const { inbox: internalInbox, loading } = nextstate

		// If loading or no followers, do nothing
		if( loading || !externalInbox ) return false

		// If remote followers are more than local, get follower details
		if( externalInbox.length != internalInbox.length ) await this.loadInbox()
		return true

	}

	// Input handler
	onInput = ( key, value ) => this.updateState( { [key]: value } )

	go = to => to && this.props.history.push( to )

	markRead = uid => app.markNutshellRead( uid )

	mute = ( userUid, nutshellUid ) => Promise.all( [
		app.markNutshellRead( nutshellUid ),
		app.unfollowPerson( userUid )
	] )

	report = async nutshellUid => this.props.history.push( `/nutshells/report/${nutshellUid}` )

	render() {

		const { loading, inbox } = this.state
		const { user } = this.props

		if( loading ) return <Loading message={ loading } />

		return <Container Background={ People }>
			<Navigation title='Home' />
			<Main.Top>
				 <Tutorial />
				{ inbox?.length > 0 && inbox.map( nutshell => <NutshellCard report={ this.report } mute={ this.mute } markRead={ this.markRead } go={ this.go } key={ nutshell.uid } nutshell={ nutshell } /> ) }
				{ inbox.length == 0 && <Placeholder /> }
			</Main.Top>
		</Container>

	}

}

export default connect( store => ( {
	user: store.user,
	inbox: store.nutshells.inbox || []
} ) )( ReadNutshell )