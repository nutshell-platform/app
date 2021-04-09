import { catcher, log, wait } from '../helpers'
import { dataFromSnap } from './helpers'
import { resetApp } from '../../redux/actions/settingsActions'
import { unregisterListeners, registerListeners } from './listeners'
import { setEmailFingerprint } from './_fingerprints'


// ///////////////////////////////
// Listeners
// ///////////////////////////////

// Listen to user authentication
export const listenUserLogin = ( app, dispatch, action, listeners ) => new Promise( resolve => {
	// Listen to the user object
	const authListener = app.auth.onAuthStateChanged( async user => {

		try {

			// Register listeners if we are logged in
			if( user ) {
				registerListeners( app, dispatch, listeners )

				const profile = await getUserProfile( app.db, user )
				await dispatch( action( profile ) )
				
				// Set email fingerprint
				await setEmailFingerprint( app )

				// If user has no score, but does have a bio or avatar, update the score
				const scoreUser = app.func.httpsCallable( 'scoreUser' )
				if( !profile.score && ( profile.avatar || profile.bio ) ) await scoreUser( profile.uid )

			}

			// Unregister listeners and reset app if we are not logged in
			if( !user ) {
				unregisterListeners( app.listeners )
				await dispatch( resetApp( ) )
			}

			// Resolve when done
			resolve( authListener )

		} catch( e ) {
			log( 'User listen error: ', e )
		}

	} )
} ) 

// Listen to user changes
export const listenUserChanges = ( app, dispatch, action ) => app.db.collection( 'users' ).doc( app.auth.currentUser?.uid ).onSnapshot( doc => {

	return dispatch( action( {
		email: app.auth.currentUser.email,
		...dataFromSnap( doc ) 
	} ) )

} )

export const listenUserMetaChanges = ( app, dispatch, action ) => app.db.collection( 'userMeta' ).doc( app.auth.currentUser?.uid ).onSnapshot( doc => {

	return dispatch( action( dataFromSnap( doc, false ) ) )

} )

export const listenContactMethods = ( app, dispatch, action ) => app.db.collection( 'userContacts' ).doc( app.auth.currentUser?.uid ).onSnapshot( doc => {

	return dispatch( action( { contactMethods: dataFromSnap( doc, false ) } ) )

} )


// ///////////////////////////////
// User actions
// ///////////////////////////////
			
// Register a new user by email and password
export const registerUser = async ( app, name, handle, email, password ) => {

	try {
		// Create account
		await app.auth.createUserWithEmailAndPassword( email, password )

		// Update profile to include name, this also triggers redux
		await app.updateUser( {
			name: name,
			handle: handle.toLowerCase()
		} )

		// Set email hash fingerprint
		await setEmailFingerprint( app )

	} catch( e ) {
		catcher( e )
	}

}

// Log in the user, this will trigger the user object listener
export const loginUser = async ( auth, email, password ) => auth.signInWithEmailAndPassword( email, password )

// Update the user profile and return the new user object to store
export const updateUser = async ( app, userUpdates ) => {

	let { uid, email, newpassword, currentpassword, newavatar, oldavatar, handle, ...updates } = userUpdates
	const { currentUser } = app.auth
	if( !currentUser ) return
	
	try {

		// If this is a sensitive change, reauthenticate
		if( currentpassword ) {
			const { EmailAuthProvider } = app.Auth
			await currentUser.reauthenticateWithCredential( EmailAuthProvider.credential( currentUser.email, currentpassword ) )
		}

		// If email change was requested, set to firebase auth object
		if( email && currentpassword ) {
			await currentUser.updateEmail( email )
			// Set email fingerprint
			await setEmailFingerprint( app )
		}
		if( newpassword && currentpassword ) {
			await currentUser.updatePassword( newpassword )
		}

		// If new file was added
		if( newavatar ) {

			// Upload new file
			const { ref } = await app.storage.child( newavatar.path ).put( newavatar.blob )
			const url = await ref.getDownloadURL()
			updates.avatar = {
				uri: url,
				path: newavatar.path
			}
			// Delete old file
			if( oldavatar ) await app.storage.child( oldavatar.path ).delete().catch( e => log( e ) )
		}

		// Set other properties to store
		await app.db.collection( 'users' ).doc( currentUser.uid ).set( {
			...updates,
			...( handle && { handle: handle.toLowerCase() } ),
			updated: Date.now()
		}, { merge: true } )


	} catch( e ) {
		log( 'User update error: ', e )
		throw e
	}

}

// Get user profile
export const getUserProfile = async ( db, user ) => {

	try {

		// Anyone is allowed to read these when logged in
		const userData = await db.collection( 'users' ).doc( user.uid ).get().then( doc => doc.data() )
		const userMeta = await db.collection( 'userMeta' ).doc( user.uid ).get().then( doc => doc.data() )

		// Will fail if it is not yourself
		const userPowers = await db.collection( 'specialPowers' ).doc( user.uid ).get().then( doc => doc.data() ).catch( f => false )

		// Will fail if their settings do not allow it
		const userContactMethods = await db.collection( 'userContacts' ).doc( user.uid ).get().then( doc => doc.data() ).catch( f => false )
		
		return {
			uid: user.uid,
			email: user.email,
			...userData,
			...userMeta,
			...userPowers,
			...userContactMethods
		}
	} catch( e ) {
		log( 'getUserProfile error: ', e )
		throw e
	}

}

// Recover password
export const resetPassword = ( auth, email ) => auth.sendPasswordResetEmail( email )

// Logout
export const logoutUser = async app => {

	const { auth, listeners } = app
	unregisterListeners( listeners )
	await auth.signOut()
	await resetApp()
}

// Delete
export const deleteUser = async ( app, password ) => {

	const { auth, db, FieldValue } = app
	const { currentUser } = auth
	const { EmailAuthProvider } = app.Auth
	if( !currentUser ) return

	try {

		await currentUser.reauthenticateWithCredential( EmailAuthProvider.credential( currentUser.email, password ) )

		await Promise.all( [
			db.collection( 'inbox' ).doc( currentUser.uid ).delete(),
			db.collection( 'nutshells' ).doc( currentUser.uid ).delete(),
			db.collection( 'settings' ).doc( currentUser.uid ).delete(),
			db.collection( 'userContacts' ).doc( currentUser.uid ).delete(),
			db.collection( 'users' ).doc( currentUser.uid ).delete(),
			db.collection( 'userMeta' ).doc( currentUser.uid ).delete(),
			db.collection( 'specialPowers' ).doc( currentUser.uid ).delete(),
		] )

		await auth.currentUser.delete()

	} catch( e ) {
		log( 'Deletion error: ', e )
		throw e.message
	}

} 

// ///////////////////////////////
// Validations
// ///////////////////////////////
export const handleIsAvailable = ( db, handle ) => db.collection( 'users' ).where( 'handle', '==', handle.toLowerCase() ).limit( 1 ).get().then( dataFromSnap ).then( docs => docs.length == 0 )

// ///////////////////////////////
// Contact methods
// ///////////////////////////////

export const updateContactMethods = ( app, methods ) => app.db.collection( 'userContacts' ).doc( app.auth.currentUser.uid ).set( methods, { merge: true } )
