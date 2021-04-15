import { log } from '../helpers'


export async function unregisterListeners( listeners ) {

	const { auth, ...datalisteners } = listeners

	for( let key in datalisteners ) {

		// If this listener key is an arry, unset all
		if( Array.isArray( datalisteners[ key ] ) ) {
			datalisteners[ key ].map( listener => listener() )
			delete datalisteners[ key ]
			return
		}


		if( typeof datalisteners[ key ] == 'function' ) {
			datalisteners[ key ]()
			delete datalisteners[ key ]
		} else {
			log( 'promise listener: ', key,  datalisteners[ key ] )
			const cancel = await datalisteners[key]
			try {
				if( typeof cancel == 'function' ) cancel()
			} catch( e ) {
				log( 'Error unregistering ', cancel, e )
			}
		}
	}

	if(  typeof auth == 'function' ) auth()

}

export async function registerListeners( app, dispatch, listeners ) {

	// Register listeners if they do not yet exist
	// if( !app.listeners.thing ) app.listeners.thing = listenForthing()
	listeners.map( ( { name, listener, action, metaAction } ) => {
		
		app.listeners[ name ] = listener( app, dispatch, action, metaAction )

	} )

}