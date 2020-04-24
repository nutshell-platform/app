import { catcher, error } from '../helpers'
import { SHA3 } from 'sha3'

export const dataFromSnap = ( snapOfDocOrDocs, withDocId=true ) => {


	// If these are multiple docs
	if( snapOfDocOrDocs.docs ) return snapOfDocOrDocs.docs.map( doc => ( { uid: doc.id, ...doc.data( ) } ) )

	// If this is a single document
	return { ...snapOfDocOrDocs.data(), ...( withDocId && { uid: snapOfDocOrDocs.id } ) }

}

export const hash = string => new SHA3( 512 ).update( string || `${Date.now()}-${Math.random()}` ).digest( 'hex' )