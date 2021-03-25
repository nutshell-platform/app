import React from 'react'

// Visual
import { Component, Container, Loading, Main, Card, View, Text, Title, Button, Divider } from '../../stateless/common/generic'
import Navigation from '../common/navigation'
import { Entry } from '../../stateless/nutshells/_read_text_entry'

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
		const queue = await app.getModerationQueue().catch( catcher )
		const scheduledNutshells = !user.admin ? false : await app.getScheduledNutshells()
		log( scheduledNutshells?.data )
		return this.updateState( { loading: false, queue: queue, ...( scheduledNutshells && { scheduledNutshells: scheduledNutshells?.data } ) } )
	}

	censor = report => Promise.all( [
		app.updateNutshell( { uid: report.nutshell.uid, hidden: true, entries: [ { title: '<Deleted>', paragraph: 'This Nutshell broke the rules. We gave it to a moose passing by.' } ] } ),
		app.markAbuseModerated( report.uid ),
		this.updateState( { queue: this.state.queue.filter( rep => rep.uid != report.uid ) } )
	] ).catch( catcher )

	setFree = report => Promise.all( [
		app.markAbuseModerated( report.uid ),
		this.updateState( { queue: this.state.queue.filter( rep => rep.uid != report.uid ) } )
	] ).catch( catcher )

	updateAlgolia = async f => {

		if( !confirm( 'Are you sure? This is a database-heavy operation and costs money!' ) ) return alert( 'Ok, cancelled' )	
		try {
			await this.updateState( { loading: 'Exporting accounts to algolia' } )
			await app.updateAllAlgoliaAccountEntries()
			alert( 'Export done' )
		} catch( e ) {
			alert( 'Error: ', e.message || JSON.stringify( e ) )
		} finally {
			this.updateState( { loading: false } )
		}
	}

	render() {

		const { loading, queue, scheduledNutshells } = this.state

		if( loading ) return <Loading message={ loading } />

		return <Container>
			<Navigation title='Moderation' />
			<Main.Top style={ { width: 500 } }>

				<Title>Lookahead</Title>
				{ scheduledNutshells && <Text style={ { marginBottom: 20 } }>{ scheduledNutshells.length } scheduled Nutshells by { scheduledNutshells.slice( 0, 10 ).reduce( ( acc, val ) => acc + `${ val.owner.name } (${ val.owner.handle }), `, '' ) }</Text> }

				<Divider />

				<Title>Moderation queue</Title>
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
				} ) }
				{ !queue?.length && <Text>Nothing to moderate</Text> }

				<Divider />

				<Title>Advanced wizardry</Title>
				<Button onPress={ this.updateAlgolia }>Update algolia</Button>

				
			</Main.Top>
		</Container>

	}

}

export default connect( store => ( {
	user: store.user
} ) )( NutshellModerator )
