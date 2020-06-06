import { dataFromSnap } from './helpers'
import { dateOfNext, catcher } from '../helpers'
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

export const setLocalTimeToSettings = async app => {

	try {

		const { db, FieldValue, auth } = app

		// If no user is logged in, do nothing
		if( !auth.currentUser ) return

		// Get timestamps of relevan days
		const fridayNoon = dateOfNext( 'friday' ).setHours( 10, 0, 0, 0 )
		const sundayNoon = dateOfNext( 'sunday' ).setHours( 10, 0, 0, 0 )
		const mondayNoon = dateOfNext( 'monday' ).setHours( 10, 0, 0, 0 )

		const { times } = await db.collection( 'settings' ).doc( auth.currentUser.uid ).get().then( dataFromSnap )

		// If the server timestamp is bigger than the local one, keep the remote because notification has been sent
		const newTimes = {
			fridayNoon: times.fridayNoon > fridayNoon ? times.fridayNoon : fridayNoon,
			sundayNoon: times.sundayNoon > sundayNoon ? times.sundayNoon : sundayNoon,
			mondayNoon: times.mondayNoon > mondayNoon ? times.mondayNoon : mondayNoon
		}

		// Set the local times to the server
		return db.collection( 'settings' ).doc( auth.currentUser.uid ).set( { times: newTimes }, { merge: true } )

	} catch( e ) {
		catcher( e )
	}

}

export const updateSettings = ( app, settings ) => app.db.collection( 'settings' ).doc( app.auth.currentUser.uid ).set( settings, { merge: true } )