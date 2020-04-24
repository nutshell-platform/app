import React from 'react'

// Visual
import { Component, Container, Loading, Main, Text } from '../../stateless/common/generic'
import Navigation from '../common/navigation'

// Data
import { log } from '../../../modules/helpers'
import app from '../../../modules/firebase/app'

// Redux
import { connect } from 'react-redux'

class ReadNutshell extends Component {

	// initialise state
	state = {
		loading: false
	}

	// Input handler
	onInput = ( key, value ) => this.updateState( { [key]: value } )

	render() {

		const { loading } = this.state
		const { user } = this.props

		if( loading ) return <Loading message={ loading } />

		return <Container>
			<Navigation title='Write your nutshell' />
			<Main.Center>
				<Text>Todo { user.name }, todo...</Text>
			</Main.Center>
		</Container>

	}

}

export default connect( store => ( {
	user: store.user
} ) )( ReadNutshell )