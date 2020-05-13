import { applyMiddleware, combineReducers, createStore } from 'redux'
import promise from 'redux-promise-middleware'
import logger from 'redux-logger'
import { isWeb, dev } from '../modules/apis/platform'
import { log } from '../modules/helpers'


// Redux persistance
import { persistStore, persistReducer } from 'redux-persist'
import storage from './storage'

// Reducers
import settingsReducer from './reducers/settingsReducer'
import userReducer from './reducers/userReducer'
import nutshellReducer from './reducers/nutshellReducer'
const reducers = combineReducers( { 
	settings: settingsReducer,
	user: userReducer,
	nutshells: nutshellReducer
} )

// Root reducer
const metaReducer = ( state, action ) => {

	switch( action.type ) {
		
		case "RESETAPP":
			log( 'Resetting app storage' )
			state = undefined
		break

	}

	return reducers( state, action )
}

// Persisted reducer
const persistedReducer = persistReducer( { key: 'root', storage: storage }, metaReducer )

// Middleware
const middleware = dev ? applyMiddleware( logger, promise ) : applyMiddleware( promise )


// Export store and persistor
export const store = createStore( persistedReducer, middleware )
export const persistor = persistStore( store )

// Have a persistor purge query option
if( isWeb && location.href.indexOf( 'purge' ) != -1 ) {
	log( 'Purge request detected' )
	persistor.purge()
	location.href = '/'
}