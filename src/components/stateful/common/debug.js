import React, { useState } from 'react'

// Visual
import { Component, Container, Main, Button, View, Text, Subheading } from '../../stateless/common/generic'
import Navigation from '../common/navigation'

// Data
import { log, catcher } from '../../../modules/helpers'

// Redux
import { connect } from 'react-redux'

class Debug extends Component {

	state = {
		open: false
	}

	toggle = f => this.updateState( { open: !this.state.open } )

	// On toggle is triggered when
	onBackgroundPress = e => this.state.open && this.toggle()

	render() {

		const { store } = this.props
		return <Container>
			<Navigation title='Admin' />
			<Main.Top style={ { width: 500 } }>
				<Subheading style={ { fontSize: 20 } }>Store:</Subheading>
				{ Object.keys( store ).map( key => <Section key={ key } heading={ key } data={ store[ key ] } /> ) }
			</Main.Top>
		</Container>

	}

}

const Section = ( { heading, data } ) => {

	const [ open, setOpen ] = useState( false )

	return <View>
		<Subheading style={ { borderBottomWidth: 1, marginBottom: 10 } } onPress={ f => setOpen( !open ) }>▶️ { heading }</Subheading>
		{ open && <Text>{ JSON.stringify( data, null, 2 ) }</Text> }
	</View>
	

}

export default connect( store => ( {
	store: store
} ) )( Debug )
