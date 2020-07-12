// Sentry debugging and Amplitude tracking
import SentryInit from './src/modules/sentry/sentry'

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

// Udates
import { updateIfAvailable } from './src/modules/apis/updates'

// Devving
import { ignoreErrors } from './src/modules/helpers'

// Firebase dependency fix, if we ever switch to Firbease native this can be removed
import { decode, encode } from 'base-64'
if( !global.btoa ) global.btoa = encode
if( !global.atob ) global.atob = decode


// ///////////////////////////////
// Main app ( web )
// ///////////////////////////////
export default class App extends React.Component {

	
	// Initialisations before anything else is done
	async componentDidMount() {

		ignoreErrors( [ 'Setting a timer' ] )

		// Put upside down if developing on mobile, but not in browser
		await setOrientation()
		injectWebCss()

		// Check for updates, ask user if they want to restart
		await updateIfAvailable()

		// Initialise Sentry
		SentryInit()
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


