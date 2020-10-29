import React from 'react'

// Visual
import { Component, Container, Loading, Main, Card, Title, Input, Button, Text, Toggle } from '../../stateless/common/generic'
import Navigation from '../common/navigation'

// Data
import { log, catcher } from '../../../modules/helpers'
import app from '../../../modules/firebase/app'

// Redux
import { connect } from 'react-redux'

class ReportNutshell extends Component {

	state = {
		offendingNutshell: {},
		loading: 'Loading offending Nutshell',
		unfollow: true,
		reported: false
	}

	componentDidMount = async f => {
		try {
			const nutshell = await app.getNutshellByUid( this.props.match.params.uid )
			return this.updateState( {
				offendingNutshell: nutshell,
				loading: false
			} )
		} catch( e ) {
			log( 'Getting offending Nutshell: ', e )
			catcher( e )
		}
	}

	toggleUnfollow = f => this.updateState( { unfollow: !this.state.unfollow } )

	recordReason = text => this.updateState( { reason: text } )

	report = async f => {

		const { unfollow, reason, offendingNutshell } = this.state
		const { user: reportingUser } = this.props
		const { user } = offendingNutshell

		// Reduce the user to useful stats
		reportingUser.following = reportingUser.following.length
		reportingUser.followers = reportingUser.followers.length

		// Set reportee data
		const report = {
			report: {
				reason: reason,
				by: reportingUser
			},
			nutshell: offendingNutshell
		}

		try {

			await this.updateState( { loading: 'Reporting Nutshell' } )

			// Unfollow offender and remove offending from queue
			if( unfollow ) await app.unfollowPerson( user.uid )
			await app.markNutshellRead( offendingNutshell.uid )

			// Report the Nutshell
			await app.reportNutshell( report )

			await this.updateState( { loading: false, reported: true } )


		} catch( e ) {
			await this.updateState( { loading: false } )
			log( 'Reporting offending Nutshell: ', e )
			catcher( e )
		}

	}

	render() {

		const { loading, offendingNutshell, unfollow, reason, reported } = this.state
		const { history } = this.props
		const { user } = offendingNutshell

		if( loading ) return <Loading message={ loading } />

		return <Container>
			<Navigation title='' />
			<Main.Center style={ { width: 500 } }>

				{ reported && <Card>
					<Title>Successfully reported</Title>
					<Button onPress={ f => history.goBack() }>Go back to where I was</Button>
				</Card> }
				{ !reported && <Card>
					<Title>Report { user.name }'s' Nutshell</Title>
					<Text>If a Nutshell breaches the terms of service you can report it. We will review the Nutshell within 24 hours and will take appropriate action.</Text>

					<Toggle onToggle={ this.toggleUnfollow } value={ unfollow } style={ { paddingVertical: 20 } } label="Unfollow this user after reporting" />
					<Input onChangeText={ this.recordReason } value={ reason } multiline={ true } label='Reason for reporting' />

					<Button onPress={ this.report }>Report this Nutshell</Button>
				</Card> }
			</Main.Center>
		</Container>

	}

}

export default connect( store => ( {
	inbox: store.nutshells?.inbox || [],
	user: store.user
} ) )( ReportNutshell )
