import { dataFromSnap } from './helpers'

// ///////////////////////////////
// Getters
// ///////////////////////////////
// Get Nutshells belonging to specific user
export const getNutshellsOfUser = ( app, uid ) => {

	const isMe = app.auth.currentUser.uid == uid

	return app.db.collection( 'nutshells' )
		.where( 'owner', '==', uid)
		.where( 'status', isMe ? 'in' : '==', isMe ? [ 'published', 'draft', 'scheduled' ] : 'published' )
		.limit( 52 ).get().then( dataFromSnap )
}

// Get Nutshell info by uid
export const getNutshellByUid = async ( db, uid ) => {

	try {

		// et nutshell data
		let nutshell = await db.collection( 'nutshells' ).doc( uid ).get()

		// If nutshell doesn't exist send the delete signal
		if( !nutshell.exists ) return { delete: true, uid: uid }

		// Retreive nutshell data
		nutshell = dataFromSnap( nutshell )	
		
		// Get user data
		const user = await db.collection( 'users' ).doc( nutshell.owner ).get().then( dataFromSnap )
		const contactMethods = await db.collection( 'userContacts' ).doc( user.uid ).get().then( doc => doc.data() ).catch( f => { console.log( f ); return false } )
		console.log( user, contactMethods )
		return { ...nutshell, user: { ...user, contactMethods: contactMethods || {} } }

	} catch( e ) {
		alert( e )
	}

}

// ///////////////////////////////
// Editors
// ///////////////////////////////
export const createNutshell = ( app, nutshell ) => {

	const { uid, ...nutshellContent } = nutshell

	return app.db.collection( 'nutshells' ).doc( uid ).set( {
		...nutshell,
		created: Date.now(),
		updated: Date.now(),
		owner: app.auth.currentUser.uid
	}, { merge: true } )

}

export const updateNutshell = ( app, nutshell ) => {

	const { uid, ...nutshellContent } = nutshell

	return app.db.collection( 'nutshells' ).doc( uid ).set( {
		...nutshellContent,
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

export const deleteNutshell = ( app, uid ) => {

	const { db } = app
	return db.collection( 'nutshells' ).doc( uid ).delete()

}

// ///////////////////////////////
// Abose
// ///////////////////////////////

export const reportNutshell = ( app, report ) => {

	const { db, FieldValue } = app

	return db.collection( 'reportedAbuse' ).add( { ...report, moderated: false } )

}

export const muteNutshell = ( app, nutshellUid ) => {

	const { db, auth, FieldValue } = app
	const { currentUser: { uid: myUid } } = auth
	return db.collection( 'userMeta' ).doc( myUid ).set( { muted: FieldValue.arrayUnion( nutshellUid ) }, { merge: true } )

}

// ///////////////////////////////
// Listeners
// ///////////////////////////////
export const listenToLatestNutshell = ( app, dispatch, action ) => {

	return app.db.collection( 'nutshells' )
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

	return app.db.collection( 'inbox' )
		.doc( app.auth.currentUser.uid )
		.onSnapshot( doc => {
			const { nutshells } = dataFromSnap( doc )
			return dispatch( action( nutshells || [] ) )

		} )
}
