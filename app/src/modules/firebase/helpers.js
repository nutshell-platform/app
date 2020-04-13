import { catcher, error } from '../helpers'

export const dataFromSnap = snapOfDocOrDocs => {

	// If these are multiple docs
	if( snapOfDocOrDocs.docs ) return snapOfDocOrDocs.docs( doc => ( { id: doc.id, ...doc.data( ) } ) )

	// If this is a single document
	return { ...snapOfDocOrDocs.data(), id: snapOfDocOrDocs.id }

}

export const another = true