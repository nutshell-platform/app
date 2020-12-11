import React from 'react'
import { BackHandler } from 'react-native'

// Redux
import { connect } from 'react-redux'
import { Light, Dark } from '../modules/visual/themes'
import { toggleDarkMode } from '../redux/actions/settingsActions'

// Firebase api
import firebase from '../modules/firebase/app'

// Udates
import { updateIfAvailable } from '../modules/apis/updates'

// Components
import { Component, Loading, Provider as PaperProvider } from '../components/stateless/common/generic'

// Routing
import { Switch, Route, withRouter } from './router'

// Helpers
import { isWeb, getIsDarkMode } from '../modules/apis/platform'
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
import Debug from '../components/stateful/common/debug'

// Route maneger class
class Routes extends Component {

	state = {
		// If there is a saved user, no loading screen, otherwise loading screen
		init: false
	}

	componentDidMount = async () => {

		// Handle purge requests
		if( isWeb && typeof location != 'undefined' && location.href.includes( 'purge' ) ) {
			log( 'Purge request detected' )
			await firebase.logout()
			location.href = '/'
		}

		// Make test nutshell if needed
		if( isWeb && typeof location != 'undefined' && location.href.includes( 'createDemoNutshell' ) ) {
			log( '🛑 Demo nutshell requested' )
			await firebase.createTestNutshell().catch( e => log( 'Error creating test nutshell: ', e ) )
		}
		

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

		// Set dark mode if need be, but only on mount so the user can override it
		this.smartDarkMode()

		// Init firebase
		await firebase.init( history )
		
		// Disable loading screen
		return this.setState( { init: true } )
		
	}

	shouldComponentUpdate = ( nextProps, nextState ) => {

		const { history, user } = nextProps
		const { pathname } = history.location
		
		// Redirect rules, if redirected, do not rerender router
		const wasRedirected = this.handleRedirects( pathname, user )

		// If redirect was triggered, do not rerender as history will trigger it
		if( wasRedirected ) return false

		// Always update by default
		return true

	}

	componentDidUpdate = f => {

		const { history } = this.props
		const { pathname } = history.location


		// Development-only logging of path
		log( 'Current path: ', pathname )

		// Update trigger
		this.scheduleUpdateCheck()

		// Log user screen
		if( pathname ) firebase.analyticsSetScreen( pathname )


	}

	smartDarkMode = f => {

		const { dispatch, theme } = this.props

		// Determint whether it is night time ( arbitrary time chosen )
		const theHour = new Date().getHours()
		const nightTime = theHour > 20 || theHour < 7

		// If system wants dark mode or it is late, set darkmode if it is not yet set
		if( ( getIsDarkMode() || nightTime ) && !theme?.dark ) return dispatch( toggleDarkMode() )

	}

	handleRedirects = ( pathname, user ) => {

		const { history } = this.props

		// Not logged in but not on the home page => go to home
		if( pathname != '/' && !user ) {
			log( 'Redirect: ', `pathname != '/' && !user` )
			history.push( '/' )

			// Signal that a redirect happened
			return true
		}
		// If logged in but at slash => go to profile
		if( pathname == '/' && user ) {
			log( 'Redirect: ', `pathname == '/' && user` )
			history.push( '/nutshells/read' )

			// Signal that a redirect happened
			return true

		}

		// Signal that no redirect happened
		return false

	}

	// Schedule an update check
	scheduleUpdateCheck = f => {

		if( this.scheduledUpdateCheck ) {
			clearTimeout( this.scheduledUpdateCheck )
			this.scheduledUpdateCheck = undefined
		}

		// Limit to once every 5 seconds in case they are navigating around
		this.scheduledUpdateCheck = setTimeout( f => {
			log( 'Checking for update...' )
			updateIfAvailable()
		}, 5000 )

	}


	render() {

		const { theme } = this.props
		const { init } = this.state

		{ /* Paper theme provider */ }
		return <PaperProvider theme={ theme || Light }>
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

				{ /* 404 */ }
				<Route path='/404' component={ FourOhFour } />

				{ /* 404 */ }
				<Route path='/debug' component={ Debug } />

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
	theme: store.settings?.theme,
	settings: store.settings
} ) )( Routes ) )