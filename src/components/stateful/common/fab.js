import React from 'react'

// Visual
import { Component, FAB, Portal, Provider } from '../../stateless/common/generic'

// Data
import { log, catcher } from '../../../modules/helpers'

// Redux
import { connect } from 'react-redux'

class Fab extends Component {

	state = {
		open: false
	}

	toggle = f => this.updateState( { open: !this.state.open } )

	// On toggle is triggered when 
	onBackgroundPress = e => this.state.open && this.toggle()

	render() {

		const { open } = this.state
		const { theme, go } = this.props

		return <Provider>
			<Portal>
				<FAB.Group
					open={ open }
					icon={ open ? 'close' : 'plus'}
					fabStyle={ { backgroundColor: theme.colors.primary } }
					style={ {  } }
					actions={[
						{ icon: 'pencil', label: 'Write nutshell', onPress: f => go( '/nutshells/write' ) },
						{ icon: 'plus', label: 'Add friends', onPress: f => go( '/friends/find' ) },
					]}
					onStateChange={ this.onBackgroundPress }
					onPress={ this.toggle }
				/>
			</Portal>
		</Provider>

	}

}

export default connect( store => ( {
	theme: store.settings?.theme
} ) )( Fab )