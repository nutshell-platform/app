import React from 'react'

// Visual
import { Component, Container, Loading, Main, Text } from '../../stateless/common/generic'
import { Placeholder, NutshellCard } from '../../stateless/nutshells/read'
import Navigation from '../common/navigation'

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

	// Load nutshells on mount
	componentDidMount = async f => {

		try {
			const { inbox } = this.props
			const nutshells = await Promise.all( inbox.map( uid => app.getNutshellByUid( uid ) ) )
			await this.updateState( { inbox: nutshells, loading: false } )
		} catch( e ) {
			alert( e )
		}

	}

	// Input handler
	onInput = ( key, value ) => this.updateState( { [key]: value } )

	go = to => to && this.props.history.push( to )

	render() {

		const { loading, inbox } = this.state
		const { user } = this.props

		if( loading ) return <Loading message={ loading } />

		return <Container>
			<Navigation title='Nutshell feed' />
			<Main.Top>
				{ inbox.map( nutshell => <NutshellCard go={ this.go } key={ nutshell.uid } nutshell={ nutshell } /> ) }
				{ inbox.length == 0 && <Placeholder /> }
			</Main.Top>
		</Container>

	}

}

export default connect( store => ( {
	user: store.user,
	inbox: store.nutshells.inbox || []
} ) )( ReadNutshell )