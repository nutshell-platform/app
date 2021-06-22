import React from 'react'
import { BackHandler } from 'react-native'

// Redux
import { connect } from 'react-redux'
import { Light } from '../modules/visual/themes'
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
import { isWeb, getIsDarkMode, dev } from '../modules/apis/platform'
import { log, wait, error } from '../modules/helpers'

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
import { Marketing } from '../components/hook/system/marketing'

// Route maneger class
class Routes extends Component {

	state = {
		// If there is a saved user, no loading screen, otherwise loading screen
		loading: true
	}

	componentDidMount = async () => {

		const { history, user } = this.props


		// Register back button handler
		this.backHandler = BackHandler.addEventListener( 'hardwareBackPress', f => {

			// Navigate back
			history.goBack()

			// Stop the event from bubbling up and closing the app
			return true

		} )

		try {

			// Set the state to initialised if a user is already in stor
			this.setState( { loading: !user } )

			// Set dark mode if need be, but only on mount so the user can override it
			this.smartDarkMode()

			// Handle query strings
			await this.handleQueryAndParams()

			// Init firebase
			await firebase.init( history )
			
			

		} catch( e ) {
			alert( `Init error: ${ e.message || JSON.stringify( e ) }` )
			error( e )
		} finally {
			// Disable loading screen
			this.setState( { loading: false } )
		}
		
	}

	handleQueryAndParams = async f => {

		const { history } = this.props
		const { queryAction } = this.state

		// If url is wrongly using hash (for example due to a direct link), fix it
		if( window?.location ) {
			const { href, host } = window.location
			const [ fullMatch, pathMatch ] = href.match( /(\w+)#/ ) || []
			if( pathMatch ) window.history.replaceState( null, '', `/#/${pathMatch}` )
		}

		// Handle purge requests
		if( isWeb && typeof location != 'undefined' && location.href.includes( 'purge' ) ) {
			log( '🛑🛑🛑 Purge request detected' )
			await firebase.logout()
			// location.href = '/'
		}

		// Make test nutshell if needed
		if( isWeb && typeof location != 'undefined' && location.href.includes( 'createDemoNutshell' ) ) {
			if( queryAction ) return
			await this.updateState( { queryAction: true } )
			log( '🛑 Demo nutshell requested' )
			await firebase.createTestNutshell().catch( e => log( 'Error creating test nutshell: ', e ) )
			log( '✅ Demo nutshell created' )
			history.replace( { search: '' } )
			await this.updateState( { queryAction: false } )
		}

		// Add test followers if needed
		if( isWeb && typeof location != 'undefined' && location.href.includes( 'addMultipleTestFollowers' ) ) {
			if( queryAction ) return
			await this.updateState( { queryAction: true } )
			log( '🛑 Demo followers requested' )
			await firebase.addMultipleTestFollowers().catch( e => log( 'Error creating test followers: ', e ) )
			log( '✅ Demo followers created' )
			history.replace( { search: '' } )
			await this.updateState( { queryAction: false } )
		}

		if( isWeb && typeof location != 'undefined' && location.href.includes( 'deleteMyDemoData' ) ) {
			if( queryAction ) return
			await this.updateState( { queryAction: true } )
			log( '🛑 Demo data deletion requested' )
			await firebase.deleteMyDemoData().catch( e => log( 'Error deleting test data: ', e ) )
			log( '✅ Demo data deleted' )
			history.replace( { search: '' } )
			await this.updateState( { queryAction: false } )
		}
		

	}

	shouldComponentUpdate = async ( nextProps, nextState ) => {

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

		// Handle query strings
		this.handleQueryAndParams()

		// Update trigger
		this.scheduleUpdateCheck()

		// Log user screen
		if( pathname && !dev ) firebase.analyticsSetScreen( pathname )


	}

	smartDarkMode = f => {

		const { dispatch, theme } = this.props

		// Determint whether it is night time ( arbitrary time chosen )
		const theHour = new Date().getHours()
		const nightTime = theHour > 20 || theHour < 7

		// Set dark mode based on combination of system and time
		const wantDark = ( getIsDarkMode() || nightTime ) || ( !getIsDarkMode() && nightTime )
		const isDark = theme?.dark

		log( `Setting dark mode to ${ wantDark } from current state ${ isDark } since ${ theHour } is ${ nightTime ? 'night time': 'day time' } and system setting is ${ getIsDarkMode() }` )

		if( wantDark && !isDark ) return dispatch( toggleDarkMode() )
		if( !wantDark && isDark ) return dispatch( toggleDarkMode() )

	}

	handleRedirects = ( pathname, user ) => {

		const { history } = this.props

		const noRedir = isWeb && typeof location != 'undefined' && location.href.includes( 'noredir' )

		// Not logged in but not on the home page => go to home
		if( !noRedir && pathname != '/' && !user ) {
			log( 'Redirect: ', `pathname != '/' && !user` )
			history.push( '/' )

			// Signal that a redirect happened
			return true
		}
		// If logged in but at slash => go to profile
		if( !noRedir && pathname == '/' && user ) {
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
		const { loading } = this.state

		{ /* Paper theme provider */ }
		return <PaperProvider theme={ theme || Light }>
			{ loading && <Loading color="black" message={ loading || 'Loading your stuff' } /> }
			{ /* App router */ }
			{ !loading && <Switch>

				{ /* Friends */ }
				<Route path='/friends/find' component={ FindFriends } />
				<Route path='/friends/manage' component={ ManageFriends } />

				{ /* Platform */ }
				<Route path='/nutshells/read/:filter?' component={ ReadNutshell } />
				<Route path='/nutshells/write' component={ WriteNutshell } />

				{ /* Moderation */ }
				<Route path='/nutshells/report/:uid' component={ ReportNutshell } />
				<Route path='/nutshells/moderate' component={ ModerateNutshells } />

				{ /* Account specific */ }
				<Route path='/user/settings' component={ UserSettings } />

				{ /* 404 */ }
				<Route path='/404' component={ FourOhFour } />

				{ /* Debugging data */ }
				<Route path='/debug' component={ Debug } />

				{ /* Mass push notifications */ }
				<Route path='/system/marketing' component={ Marketing } />

				{ /* Unknown url? Check if it is a user */ }
				<Route path='/:handle/:filter?' component={ UserProfile } />

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