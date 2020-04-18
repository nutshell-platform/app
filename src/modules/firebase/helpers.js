import { catcher, error } from '../helpers'

export const dataFromSnap = ( snapOfDocOrDocs, withDocId=true ) => {

	// If these are multiple docs
	if( snapOfDocOrDocs.docs ) return snapOfDocOrDocs.docs( doc => ( { id: doc.id, ...doc.data( ) } ) )

	// If this is a single document
	return { ...snapOfDocOrDocs.data(), ...( withDocId && { id: snapOfDocOrDocs.id } ) }

}

export const another = true