import { dataFromSnap, hash } from './helpers'
import { getFingerprints } from '../apis/contacts'

export const setEmailFingerprint = app => {
	const { db, FieldValue, auth } = app
	const { currentUser: user } = auth
	return db.collection( 'fingerprints' ).doc( user.email ).set( { owners: FieldValue.arrayUnion( user.uid ) }, { merge: true } )
}

export const getAndSaveFingerprints = async app => {

	try {

		// Get relevant functions and data
		const { func, auth: currentUser } = app
		const save = func.httpsCallable( 'saveFingerprints' )

		// Grab prints from contact book
		const fingerprints = await getFingerprints()

		// Send to cloud function
		await save( fingerprints )


	} catch( e ) {

		alert( 'Something went wrong saving your contacts 🙉' )
		throw e
		
	}
}