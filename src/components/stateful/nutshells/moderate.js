import React from 'react'

// Visual
import { Component, Container, Loading, Main, Card, View, Text, Button } from '../../stateless/common/generic'
import Navigation from '../common/navigation'
import { Entry } from '../../stateless/nutshells/read'

// Data
import { log, catcher } from '../../../modules/helpers'
import app from '../../../modules/firebase/app'

// Redux
import { connect } from 'react-redux'

class NutshellModerator extends Component {

	state = {
		loading: 'Loading messages to be moderated'
	}

	componentDidMount = async f => {
		const { history, user } = this.props
		if( !user.moderator ) return history.push( '/' )
		const queue = await app.getModerationQueue()
		return this.updateState( { loading: false, queue: queue } )
	}

	censor = report => Promise.all( [
		app.updateNutshell( { uid: report.nutshell.uid, hidden: true, entries: [ { title: '<Deleted>', paragraph: 'This Nutshell broke the rules. We gave it to a moose passing by.' } ] } ),
		app.markAbuseModerated( report.uid ),
		this.updateState( { queue: this.state.queue.filter( rep => rep.uid != report.uid ) } )
	] )

	setFree = report => Promise.all( [
		app.markAbuseModerated( report.uid ),
		this.updateState( { queue: this.state.queue.filter( rep => rep.uid != report.uid ) } )
	] )

	render() {

		const { loading, queue } = this.state

		if( loading ) return <Loading message={ loading } />

		return <Container>
			<Navigation title='' />
			<Main.Top style={ { width: 500 } }>
				{ queue?.map( item => {
					const { nutshell, report } = item
					const { user: reportedUser } = nutshell
					return <Card key={ item.uid }>
						<Text>Written by { reportedUser.handle || reportedUser.name }. Reported by { report.by.handle }</Text>
						<Text>Reason: { report.reason }</Text>
						<View style={ { width: '100%', alignItems: 'flex-start', justifyContent: 'center' } }>
							{ nutshell.entries.map( entry => <Entry key={ entry.uid } entry={ entry } /> ) }
							<Button onPress={ f => this.censor( item ) }>Guilty your honour</Button>
							<Button onPress={ f => this.setFree( item ) }>You're free to leave son</Button>
						</View>
					</Card>
				}) }
			</Main.Top>
		</Container>

	}

}

export default connect( store => ( {
	user: store.user
} ) )( NutshellModerator )
