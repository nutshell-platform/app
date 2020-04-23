import { SHA3 } from 'sha3'
import { dataFromSnap } from './helpers'

export const setEmailFingerprint = ( db, user ) => {
	const emailHash = new SHA3( 512 ).update( user.email ).digest( 'hex' )
	return db.collection( 'fingerprints' ).doc( user.uid ).set( { email: emailHash }, { merge: true } )
}

export const another = true