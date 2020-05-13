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