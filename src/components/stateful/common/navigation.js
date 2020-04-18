import React from 'react'
import { Animated, Platform } from 'react-native'
import { Component } from '../../stateless/common/generic'
import { Header, Menu } from '../../stateless/common/navigation'
import { connect } from 'react-redux'
import { withRouter } from '../../../routes/router'
import { toggleDarkMode } from '../../../redux/actions/settingsActions'
import { capitalize, log } from '../../../modules/helpers'
import app from '../../../modules/firebase/app'

class Navigation extends Component {

	state = {
		drawer: false,
		drawerWidth: 300,
		drawerSpeed: 500
	}

	// Drawer toggler
	toggleDrawer = async config => {

		const { drawer, drawerWidth, drawerSpeed } = this.state
		const force = config == 'force'

		// If the drawer is open, move it to closed position
		if( drawer && !force ) Animated.timing( this.pan, { toValue: { x: drawerWidth, y: 0 }, duration: drawerSpeed } ).start( f => this.updateState( { drawer: !drawer } ) )
		
		// If drawer is closed, dirst mount, then animate open
		else if( !drawer || force ) {
			if( !force ) await this.updateState( { drawer: !drawer } )
			Animated.timing( this.pan, { toValue: { x: 0, y: 0 }, duration: drawerSpeed } ).start()
		}
	}

	// The animated .event function returns a function
	pan = new Animated.ValueXY( { x: this.state.drawerWidth, y: 0 } )
	handleDrag = Animated.event(
		[ { translationX: this.pan.x } ],
		// { useNativeDriver: Platform.OS != 'web' },
		{ useNativeDriver: false }
	)

	panDrawer = ( { nativeEvent } ) => {

		const { translationX, velocityX, state, oldState } = nativeEvent
		const { drawerWidth } = this.state

		// If drag is not on x axis or is to the left of base position ignore
		if( !translationX || translationX < 0 ) return

		// Animate if state is pulling
		if( state == 4 ) return this.handleDrag( nativeEvent )

		// If we let go, either reset or hide
		if( state == 5 && ( translationX > drawerWidth / 5 || velocityX > 2 ) ) return this.toggleDrawer()
		else return this.toggleDrawer( 'force' )

	}

	toggleDarkMode = f => {
		console.log( 'Toggle dark' )
		return this.props.dispatch( toggleDarkMode() )
	}

	render( ) {

		const { title, user, history } = this.props
		const { drawer, drawerWidth, drawerOffset } = this.state

		return <Header
			drawerTranslate={ { transform: this.pan.getTranslateTransform() } }
			drawerOffset={ drawerOffset }
			drawerWidth={ drawerWidth }
			pan={ this.panDrawer }
			toggle={ this.toggleDrawer } 
			title={ capitalize( title ) }
			drawer={ drawer }
			toggleDark={ this.toggleDarkMode }
			go={ to => history.push( to ) }
			links={ [

				// Static links
				{ label: 'Home', to: '/' },

				// Dynamic links when user is logged in
				...( user ? [
					{ label: 'Logout', onPress: app.logout }
				] : [] )
			] }
		/>
	}

}

export default withRouter( connect( store => ( {
	user: !!store.user
} ) )( Navigation ) )