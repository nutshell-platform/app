// Sentry debugging and Amplitude tracking
// import SentryInit from './src/modules/sentry'

// React
import React from 'react'

// Redux
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './src/redux/store'

// Import router
import Routes from './src/routes/routes'
import { History, Router } from './src/routes/router'

// Visual
import { Loading } from './src/components/stateless/common/generic'
import { setOrientation } from './src/modules/visual/screen'
import { injectWebCss } from './src/modules/visual/style'

// Push notifications
import { askForPushPermissions } from './src/modules/push'

// Udates
import { updateIfAvailable } from './src/modules/updates'


// ///////////////////////////////
// Main app ( web )
// ///////////////////////////////
export default class App extends React.Component {

	
	async componentDidMount() {

		// Put upside down if developing on mobile, but not in browser
		await setOrientation()
		injectWebCss()

		// Check for updates, ask user if they want to restart
		await updateIfAvailable()

		// Initialise Sentry
		// SentryInit()

		// Create and store expo push token in secure storage { pushtoken }
		// await askForPushPermissions()
	}


	// Return the app with routing
	render( ) {

		return (

			// Connect redux store
			<Provider store={ store }>
				{ /* Redux store persistence across reloads and visits */ }
				<PersistGate loading={ <Loading /> } persistor={ persistor }>
						{ /* Connect router */ }
						<Router history={ History }>
							<Routes />
						</Router>
						
				</PersistGate>
			</Provider>

		)
	}

}


