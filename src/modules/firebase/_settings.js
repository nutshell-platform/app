import { dataFromSnap } from './helpers'

export const listenSettings = ( app, dispatch, action ) => {

	app.db.collection( 'settings' ).doc( app.auth.currentUser.uid ).onSnapshot( doc => {

		return dispatch( action( dataFromSnap( doc, false ) ) )

	} )

}

export const updateSettings = ( app, settings ) => app.db.collection( 'settings' ).doc( app.auth.currentUser.uid ).set( settings, { merge: true } )