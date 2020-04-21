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

// Components
import LoginRegistration from '../components/stateful/onboarding/login-register'
import UserSettings from '../components/stateful/account/user-settings'
import WriteNutshell from '../components/stateful/nutshells/write'
import ReadNutshell from '../components/stateful/nutshells/read'
import FindFriends from '../components/stateful/account/friends-find'

// Route maneger class
class Routes extends Component {

	state = {
		init: false
	}

	componentDidMount = async () => {
		await firebase.init()
		return this.setState( { init: true } )
	}

	shouldComponentUpdate = ( nextProps, nextState ) => {

		const { history, user, settings } = nextProps
		const { pathname } = history.location

		// ///////////////////////////////
		// Redirect rules
		// ///////////////////////////////

		// Not logged in but not on the home page => go to home
		if( pathname != '/' && !user ) history.push( '/' )
		// If logged in but at home => go to profile
		if( pathname == '/' && user ) history.push( '/nutshells/write' )

		// Logged in for the first time ( no settings yet )
		if( pathname != '/user/settings' && ( user && ( !settings?.notifications || !user.bio ) ) ) history.push( '/user/settings' )

		// On prop or state chang, always update
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

				{ /* Platform */ }
				<Route path='/nutshells/read' component={ ReadNutshell } />
				<Route path='/nutshells/write' component={ WriteNutshell } />

				{ /* Account specific */ }
				<Route path='/user/settings' component={ UserSettings } />

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