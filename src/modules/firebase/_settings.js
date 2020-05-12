import { dataFromSnap } from './helpers'
import { getTokenIfNeeded, registerNotificationListeners } from '../push'

export const listenSettings = ( app, dispatch, action ) => {

	const { db, FieldValue, auth } = app

	db.collection( 'settings' ).doc( auth.currentUser.uid ).onSnapshot( async doc => {

		const settings = dataFromSnap( doc, false )
		const pushToken = await getTokenIfNeeded( settings )
		
		// New token? Send to firebase
		if( pushToken ) await db.collection( 'settings' ).doc( auth.currentUser.uid ).set( { pushTokens: FieldValue.arrayUnion( pushToken ) }, { merge: true } )

		// If we have tokens, listen for notis
		if( settings.pushTokens?.length != 0 ) registerNotificationListeners()

		return dispatch( action( settings ) )

	} )

}

export const updateSettings = ( app, settings ) => app.db.collection( 'settings' ).doc( app.auth.currentUser.uid ).set( settings, { merge: true } )