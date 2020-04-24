import { dataFromSnap, hash } from './helpers'

export const setEmailFingerprint = ( db, user ) => {
	const emailHash = hash( user.email )
	return db.collection( 'fingerprints' ).doc( user.uid ).set( { email: emailHash }, { merge: true } )
}

export const another = true