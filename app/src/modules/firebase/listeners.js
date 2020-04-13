import { getUserProfile } from './user'

export function unregisterListeners( listeners ) {

	const { auth, ...datalisteners } = listeners

	for( let key in datalisteners ) {
		listeners[ key ] && listeners[ key ]()
		delete listeners[ key ]
	}

}

export async function registerListeners( app, dispatch, listeners ) {

	// Register listeners if they do not yet exist
	// if( !app.listeners.thing ) app.listeners.thing = listenForthing()
	listeners.map( ( { name, listener, action, end } ) => {
		
		app.listeners[ name ] = listener( app, dispatch, action, end )

	} )

}

export const listenForUserAndStartListeners = ( app, dispatch, onLoginAction, onLogoutAction ) => {
	// Listen to the user object
	return app.auth.onAuthStateChanged( async user => {

		// Register listeners if we are logged in
		if( user ) {
			registerListeners( app )
			return dispatch( onLoginAction( await getUserProfile( app.db, user ) ) )
		}

		// Unregister listeners and reset app if we are not logged in
		if( !user ) {
			unregisterListeners( app.listeners )
			return dispatch( onLogoutAction( ) )
		}
	} )
}