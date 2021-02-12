import React from 'react'
import { Animated } from 'react-native'

// Visual
import { Component, Appbar } from '../../stateless/common/generic'
import { Header, Menu } from '../../stateless/common/navigation'

// Data & routing
import { connect } from 'react-redux'
import { withRouter } from '../../../routes/router'
import app from '../../../modules/firebase/app'

// Helpers
import { capitalize, log, Dialogue } from '../../../modules/helpers'
import { sendEmail } from '../../../modules/apis/messaging'
import { version, OS } from '../../../modules/apis/platform'


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
		if( drawer && !force ) Animated.timing( this.pan, { toValue: { x: drawerWidth, y: 0 }, duration: drawerSpeed, useNativeDriver: false } ).start( f => this.updateState( { drawer: !drawer } ) )
		
		// If drawer is closed, dirst mount, then animate open
		else if( !drawer || force ) {
			if( !force ) await this.updateState( { drawer: !drawer } )
			Animated.timing( this.pan, { toValue: { x: 0, y: 0 }, duration: drawerSpeed, useNativeDriver: false } ).start()
		}
	}

	// The animated .event function returns a function
	pan = new Animated.ValueXY( { x: this.state.drawerWidth, y: 0 } )
	handleDrag = Animated.event(
		[ { translationX: this.pan.x } ],
		// Do not enable native driver, the PanGestureHandler can't handle native
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

	mailBugreport = async f => {

		const { user: { name, handle } } = this.props

		await Dialogue( '💌 Your email client will open', `Your input is super appreciated ${ handle }.\n\nWe have pre-composed an email for you, please edit the relevant parts with your input.` )

		const message = `Hello nutshell team!
			My name is ${ name }, my nutshell handle is ${ handle }.
			I encountered a problem:
			1. I was trying to ✏️ insert_what_you_were_doing
			2. I expected the app to ✏️ insert_what_you_expeted_to_happen
			3. Instead, the app ✏️ insert_what_happened
			I am using app version "${ version }" on ${ OS }.
			Thanks for taking a look at it!
			Sincerely,
			${ name }
		`

		return sendEmail( 'bugs@nutshell.social', '🐞 Nutshell bug report', message )

	}

	mailFeaturerequest = async f => {

		const { user: { name, handle } } = this.props

		await Dialogue( '💌 Your email client will open', `Your input is super appreciated ${ handle }.\n\nWe have pre-composed an email for you, please edit the relevant parts with your input.` )

		const message = `Hello nutshell team!
			My name is ${ name }, my nutshell handle is ${ handle }.
			I would like to suggest a feature, it would be great if:
			✏️ Insert_your_feature_idea.
			I am using app version "${ version }" on ${ OS }.
			Thanks for taking a look at it!
			Sincerely,
			${ name }
		`

		return sendEmail( 'features@nutshell.social', '✨ Nutshell feature request', message )

	}

	render( ) {

		const { title, user, history } = this.props
		const { drawer, drawerWidth, drawerOffset } = this.state
		const links = [ ]

		// Add links relevant to the user
		if( user ) links.push( {
			label: 'Account management',
			links: [
				{ label: 'Your Profile', to: `/${user.handle}` },
				{ label: 'Manage Friends', to: '/friends/manage' },
				{ label: 'Settings', to: '/user/settings' },
				{ label: 'Logout', onPress: app.logout }
			]
		} )

		// Add moderation link
		if( user?.moderator ) links.push( { 
			label: 'Superpowers',
			links: [
				{ label: 'Moderation', to: '/nutshells/moderate' }
			]
		} )

		// Add debugging link
		if( user?.admin ) links.push( { 
			label: 'Admin',
			links: [
				{ label: 'Debugging', to: '/debug' },
				{ label: 'Request demo Nutshells', onPress: app.createTestNutshell }
			]
		} )

		// Add bug/feedback links
		if( user ) links.push( {
			label: 'Help & support',
			links: [
				{ label: 'Report a problem', onPress: this.mailBugreport },
				{ label: 'Request a feature', onPress: this.mailFeaturerequest },
			]
		} )

		return <Header
			drawerTranslate={ { transform: this.pan.getTranslateTransform() } }
			drawerOffset={ drawerOffset }
			drawerWidth={ drawerWidth }
			pan={ this.panDrawer }
			toggle={ this.toggleDrawer } 
			title={ capitalize( title ) }
			drawer={ drawer }
			links={ links } >
				{ user && <Appbar.Action nativeID='navigation-home' icon='home' onPress={ f => history.push( `/` ) } /> }
				{ user && <Appbar.Action nativeID='navigation-findfriends' icon='account-plus' onPress={ f => history.push( `/friends/find` ) } /> }
				{ user && <Appbar.Action nativeID='navigation-writenutshel' icon='pencil-outline' onPress={ f => history.push( `/nutshells/write` ) } /> }
		</Header>
	}

}

export default withRouter( connect( store => ( {
	user: store.user
} ) )( Navigation ) )