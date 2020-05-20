import React from 'react'

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

// Friends
import FindFriends from '../components/stateful/account/friends-find'
import ManageFriends from '../components/stateful/account/friends-manage'

// System
import FourOhFour from '../components/stateless/common/404'

// Route maneger class
class Routes extends Component {

	state = {
		init: false
	}

	componentDidMount = async () => {

		// If url is wrongly using hash (for example due to a direct link), fix it
		if( window?.location ) {
			const { href, host } = window.location
			const [ fullMatch, pathMatch ] = href.match( /(\w+)#/ ) || []
			if( pathMatch ) window.history.replaceState( null, '', `/#/${pathMatch}` )
		}

		// Init firebase
		await firebase.init()
		return this.setState( { init: true } )
	}

	shouldComponentUpdate = ( nextProps, nextState ) => {

		const { history, user, settings } = nextProps
		const { pathname } = history.location

		// Development-only logging of path
		log( pathname )

		// ///////////////////////////////
		// Redirect rules
		// ///////////////////////////////

		// Not logged in but not on the home page => go to home
		if( pathname != '/' && !user ) history.push( '/' )
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
				<Route path='/nutshells/report/:uid' component={ ReportNutshell } />

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