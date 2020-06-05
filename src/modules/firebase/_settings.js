import { dataFromSnap } from './helpers'
import { dateOfNext } from '../helpers'
import { getTokenIfNeeded, registerNotificationListeners } from '../push'

export const listenSettings = ( app, dispatch, action ) => {

	const { db, FieldValue, auth } = app

	db.collection( 'settings' ).doc( auth.currentUser.uid ).onSnapshot( async doc => {

		const settings = dataFromSnap( doc, false )
		const pushToken = await getTokenIfNeeded( settings )
		
		// New token? Send to firebase
		if( pushToken ) await db.collection( 'settings' ).doc( auth.currentUser.uid ).set( {
			// Add push token
			pushTokens: FieldValue.arrayUnion( pushToken )
			
		}, { merge: true } )


		// If we have tokens, listen for notis
		if( settings.pushTokens?.length != 0 ) registerNotificationListeners()

		return dispatch( action( settings ) )

	} )

}

export const setLocalTimeToSettings = app => {

	const { db, FieldValue, auth } = app

	const fridayNoon = dateOfNext( 'friday' ).setHours( 10, 0, 0, 0 )
	const sundayNoon = dateOfNext( 'sunday' ).setHours( 10, 0, 0, 0 )
	const mondayNoon = dateOfNext( 'monday' ).setHours( 10, 0, 0, 0 )

	// Set the local times to the server
	return db.collection( 'settings' ).doc( auth.currentUser.uid ).set( {
		times: {
			fridayNoon: fridayNoon,
			sundayNoon: sundayNoon,
			mondayNoon: mondayNoon
		}
	}, { merge: true } )

}

export const updateSettings = ( app, settings ) => app.db.collection( 'settings' ).doc( app.auth.currentUser.uid ).set( settings, { merge: true } )