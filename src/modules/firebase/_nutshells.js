import { dataFromSnap } from './helpers'
import { log, catcher } from '../helpers'
import { updateOfflineInbox } from '../../redux/actions/nutshellActions'

// ///////////////////////////////
// Getters
// ///////////////////////////////
// Get Nutshells belonging to specific user
export const getNutshellsOfUser = async ( app, uid ) => {

	const isMe = app.auth.currentUser?.uid == uid

	return app.db.collection( 'nutshells' )
		.where( 'owner', '==', uid)
		.where( 'status', isMe ? 'in' : '==', isMe ? [ 'published', 'draft', 'scheduled' ] : 'published' )
		.limit( 52 ).get()
		.then( dataFromSnap )

}

// Get Nutshell info by uid
export const getNutshellByUid = async ( db, uid, dispatch ) => {

	try {

		// et nutshell data
		let nutshell = await db.collection( 'nutshells' ).doc( uid ).get()

		// If nutshell doesn't exist send the delete signal
		if( !nutshell.exists ) {
			log( `Nutshell ${ uid } was unavailable` )
			return { delete: true, uid: uid }
		}

		// Retreive nutshell data
		nutshell = dataFromSnap( nutshell )	
		
		// Get user data
		const user = await db.collection( 'users' ).doc( nutshell.owner ).get().then( dataFromSnap )
		const contactMethods = await db.collection( 'userContacts' ).doc( user.uid ).get().then( doc => doc.data() ).catch( e => {
			// log( 'Problem reading contacts for ', user.uid, e )
			return false
		} )

		nutshell = { ...nutshell, user: { ...user, contactMethods: contactMethods || {} } }
		// log( `Nutshell ${ uid } to store: `, nutshell )
		await dispatch( updateOfflineInbox( [ nutshell ] ) )
		return nutshell

	} catch( e ) {
		alert( e )
	}

}

export const getNutshellsByUids = async ( db, uids, dispatch ) => {

	try {

		const allUsers = {}
		const allContactMethods = {}

		const nutshells = await Promise.all( uids.map( async uid => {

			try {

				// get nutshell data
				let nutshell = await db.collection( 'nutshells' ).doc( uid ).get()

				// If nutshell doesn't exist send the delete signal
				if( !nutshell.exists ) {
					log( `Nutshell ${ uid } was unavailable` )
					return { delete: true, uid: uid }
				}

				// Retreive nutshell data
				nutshell = dataFromSnap( nutshell )	
				
				// Get user data
				const user = allUsers[ nutshell.owner ] || await db.collection( 'users' ).doc( nutshell.owner ).get().then( dataFromSnap )
				const contactMethods = allContactMethods[user.uid] || await db.collection( 'userContacts' ).doc( user.uid ).get().then( doc => doc.data() ).catch( e => {
					// log( 'Problem reading contacts for ', user.uid, e )
					return false
				} )

				nutshell = { ...nutshell, user: { ...user, contactMethods: contactMethods || {} } }

				return nutshell
				
			} catch {
				return {}
			}


		} ) )

		
		log( `Loaded ${ nutshells?.length } nutshells from remote to local redux` )
		await dispatch( updateOfflineInbox( nutshells ) )
		return nutshells

	} catch( e ) {
		alert( e )
	}

}

// ///////////////////////////////
// Editors
// ///////////////////////////////
export const createTestNutshell = app => {

	// Get funcs and data
	const { func } = app
	const makeTestNutshell = func.httpsCallable( 'createTestNutshell' )

	// Generare recommendations
	return makeTestNutshell().then( f => alert( 'Success' ) ).catch( e => alert( `Fail ${ e.message }` ) )

}

export const createNutshell = ( app, nutshell ) => {

	const { uid } = nutshell

	return app.db.collection( 'nutshells' ).doc( uid ).set( {
		...nutshell,
		created: Date.now(),
		updated: Date.now(),
		owner: app.auth.currentUser?.uid
	}, { merge: true } )

}

export const updateNutshell = ( app, nutshell ) => {

	const { uid, ...nutshellContent } = nutshell

	// Delete remote nutshell entry if there is no content in the draft
	const { entries, audio } = nutshellContent
	if( !entries?.length && !audio?.length ) {
		log( 'Updated nutshell has no content, deleting from remote' )
		return app.db.collection( 'nutshells' ).doc( uid ).delete()
	}

	return app.db.collection( 'nutshells' ).doc( uid ).set( {
		...nutshellContent,
		updated: Date.now(),
		owner: app.auth.currentUser?.uid
	}, { merge: true } )

}

export const markNutshellRead = ( app, uid ) => {

	const { db, FieldValue } = app

	return Promise.all( [
		db.collection( 'nutshells' ).doc( uid ).set( { readcount: FieldValue.increment( 1 ) }, { merge: true } ),
		db.collection( 'inbox' ).doc( app.auth.currentUser?.uid ).set( { nutshells: FieldValue.arrayRemove( uid ) }, { merge: true } ),
		db.collection( 'archive' ).doc( app.auth.currentUser?.uid ).set( { nutshells: FieldValue.arrayUnion( uid ) }, { merge: true } )
	] )

}

export const removeNutshellFromArchive = ( app, uid ) => {

	const { db, FieldValue } = app

	log( `Removing ${ uid } from archive` )

	return db.collection( 'archive' ).doc( app.auth.currentUser?.uid ).set( { nutshells: FieldValue.arrayRemove( uid ) }, { merge: true } )

}

export const deleteNutshell = ( app, uid ) => {

	const { db, FieldValue } = app
	return Promise.all( [
		db.collection( 'nutshells' ).doc( uid ).delete(),
		db.collection( 'inbox' ).doc( app.auth.currentUser?.uid ).set( { nutshells: FieldValue.arrayRemove( uid ) }, { merge: true } )		
	] )

}

// ///////////////////////////////
// Abuse
// ///////////////////////////////

export const reportNutshell = ( app, report ) => {

	const { db } = app

	return db.collection( 'reportedAbuse' ).add( { ...report, moderated: false } )

}

export const muteNutshell = ( app, nutshellUid ) => {

	const { db, auth, FieldValue } = app
	return db.collection( 'userMeta' ).doc( auth.currentUser?.uid ).set( { muted: FieldValue.arrayUnion( nutshellUid ) }, { merge: true } )

}

// ///////////////////////////////
// Listeners
// ///////////////////////////////
export const listenToLatestNutshell = ( app, dispatch, action ) => {

	if( !app.auth.currentUser?.uid ) return

	return app.db.collection( 'nutshells' )
		.where( 'owner', '==', app.auth.currentUser?.uid )
		.where( 'status', 'in', [ 'draft', 'scheduled' ] )
		.orderBy( 'updated', 'desc' )
		.limit( 1 ).onSnapshot( doc => {

			// Data from snap returns array limited to one unit
			const [ nutshell ] = dataFromSnap( doc )
			return dispatch( action( nutshell ) )

		} )
}

export const listenToNutshellInbox = ( app, dispatch, action ) => {

	if( !app.auth.currentUser?.uid ) return

	return app.db.collection( 'inbox' )
		.doc( app.auth.currentUser?.uid )
		.onSnapshot( doc => {
			const { nutshells } = dataFromSnap( doc )
			return dispatch( action( nutshells || [] ) )

		} )
}

export const listenToNutshellArchive = ( app, dispatch, action ) => {

	if( !app.auth.currentUser?.uid ) return

	return app.db.collection( 'archive' )
		.doc( app.auth.currentUser?.uid )
		.onSnapshot( doc => {
			const { nutshells } = dataFromSnap( doc )
			return dispatch( action( nutshells || [] ) )

		} )
}
