import { dataFromSnap } from './helpers'

// ///////////////////////////////
// Getters
// ///////////////////////////////
// Get nutshells belonging to specific user
export const getNutshellsOfUser = ( app, uid ) => {

	const isMe = app.auth.currentUser.uid == uid

	return app.db.collection( 'nutshells' )
		.where( 'owner', '==', uid)
		.where( 'status', isMe ? 'in' : '==', isMe ? [ 'published', 'draft', 'scheduled' ] : 'published' )
		.limit( 5 ).get().then( dataFromSnap )
}

// Get nutshell info by uid
export const getNutshellByUid = async ( db, uid ) => {

	const nutshell = await db.collection( 'nutshells' ).doc( uid ).get().then( dataFromSnap )
	const user = await db.collection( 'users' ).doc( nutshell.owner ).get().then( dataFromSnap )
	return { ...nutshell, user: user }

}

// ///////////////////////////////
// Editors
// ///////////////////////////////
export const createNutshell = ( app, nutshell ) => {

	return app.db.collection( 'nutshells' ).add( {
		...nutshell,
		created: Date.now(),
		updated: Date.now(),
		owner: app.auth.currentUser.uid
	} )

}

export const updateNutshell = ( app, nutshell ) => {

	const { uid } = nutshell
	delete nutshell.uid

	return app.db.collection( 'nutshells' ).doc( uid ).set( {
		...nutshell,
		updated: Date.now(),
	}, { merge: true } )

}

export const markNutshellRead = ( app, uid ) => {

	const { db, FieldValue } = app

	return Promise.all( [
		db.collection( 'nutshells' ).doc( uid ).set( { readcount: FieldValue.increment( 1 ) }, { merge: true } ),
		db.collection( 'inbox' ).doc( app.auth.currentUser.uid ).set( { nutshells: FieldValue.arrayRemove( uid ) }, { merge: true } )
	] )

}

// ///////////////////////////////
// Listeners
// ///////////////////////////////
export const listenToLatestNutshell = ( app, dispatch, action ) => {

	app.db.collection( 'nutshells' )
		.where( 'owner', '==', app.auth.currentUser.uid )
		.where( 'status', 'in', [ 'draft', 'scheduled' ] )
		.orderBy( 'updated', 'desc' )
		.limit( 1 ).onSnapshot( doc => {

			// Data from snap returns array limited to one unit
			const [ nutshell ] = dataFromSnap( doc )
			return dispatch( action( nutshell ) )

		} )
}

export const listenToNutshellInbox = ( app, dispatch, action ) => {

	app.db.collection( 'inbox' )
		.doc( app.auth.currentUser.uid )
		.onSnapshot( doc => {
			const { nutshells } = dataFromSnap( doc )
			return dispatch( action( nutshells || [] ) )

		} )
}