import React from 'react'
import { BackHandler } from 'react-native'

// Redux
import { connect } from 'react-redux'

// Theming
import { Provider as PaperProvider } from 'react-native-paper'

// Firebase api
import firebase from '../modules/firebase/app'

// Components
import { Component, Loading } from '../components/stateless/common/generic'

// Routing
import { Switch, Route, withRouter } from './router'

// Helpers
import { log } from '../modules/helpers'

// Components
import LoginRegistration from '../components/stateful/onboarding/login-register'
import UserSettings from '../components/stateful/account/user-settings'
import UserProfile from '../components/stateful/account/user-profile'

// Nutshells
import WriteNutshell from '../components/stateful/nutshells/write'
import ReadNutshell from '../components/stateful/nutshells/read'
import ReportNutshell from '../components/stateful/nutshells/report'
import ModerateNutshells from '../components/stateful/nutshells/moderate'

// Friends
import FindFriends from '../components/stateful/account/friends-find'
import ManageFriends from '../components/stateful/account/friends-manage'

// System
import FourOhFour from '../components/stateless/common/404'

// Route maneger class
class Routes extends Component {

	state = {
		// If there is a saved user, no loading screen, otherwise loading screen
		init: false
	}

	componentDidMount = async () => {

		const { history, user } = this.props

		// If url is wrongly using hash (for example due to a direct link), fix it
		if( window?.location ) {
			const { href, host } = window.location
			const [ fullMatch, pathMatch ] = href.match( /(\w+)#/ ) || []
			if( pathMatch ) window.history.replaceState( null, '', `/#/${pathMatch}` )
		}

		// Register back button handler
		this.backHandler = BackHandler.addEventListener( 'hardwareBackPress', f => {

			// Navigate back
			history.goBack()

			// Stop the event from bubbling up and closing the app
			return true

		} )

		// Set the state to initialised if a user is already in stor
		this.setState( { init: !!user } )
		// Init firebase
		await firebase.init()
		
		// Disable loading screen
		return this.setState( { init: true } )
		
	}

	shouldComponentUpdate = ( nextProps, nextState ) => {

		const { history, user, settings } = nextProps
		const { pathname } = history.location

		// Development-only logging of path
		log( 'Current path: ', pathname )

		// ///////////////////////////////
		// Redirect rules
		// ///////////////////////////////

		// Not logged in but not on the home page => go to home
		if( pathname != '/' && !user ) {
			history.push( '/' )
			// Do not update router since the history is changing
			return false
		}
		// If logged in but at slash => go to profile
		if( pathname == '/' && user ) history.push( '/nutshells/read' )

		return true

	}

	render() {

		const { theme } = this.props
		const { init } = this.state

		{ /* Paper theme provider */ }
		return <PaperProvider theme={ theme }>
			{ !init && <Loading message='Loading your stuff' /> }
			{ /* App router */ }
			{ init && <Switch>

				{ /* Friends */ }
				<Route path='/friends/find' component={ FindFriends } />
				<Route path='/friends/manage' component={ ManageFriends } />

				{ /* Platform */ }
				<Route path='/nutshells/read' component={ ReadNutshell } />
				<Route path='/nutshells/write' component={ WriteNutshell } />

				{ /* Moderation */ }
				<Route path='/nutshells/report/:uid' component={ ReportNutshell } />
				<Route path='/nutshells/moderate' component={ ModerateNutshells } />

				{ /* Account specific */ }
				<Route path='/user/settings' component={ UserSettings } />

				{ /* Home */ }
				<Route path='/404' component={ FourOhFour } />

				{ /* Unknown url? Check if it is a user */ }
				<Route path='/:handle' component={ UserProfile } />

				{ /* Home */ }
				<Route path='/' component={ LoginRegistration } />

			</Switch> }
		</PaperProvider>

	}

}

export default withRouter( connect( store => ( {
	user: store.user,
	theme: store.settings.theme,
	settings: store.settings
} ) )( Routes ) )