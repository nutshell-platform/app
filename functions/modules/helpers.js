exports.dataFromSnap = ( snapOfDocOrDocs, withDocId=true ) => {

	// If these are multiple docs
	if( snapOfDocOrDocs.docs ) return snapOfDocOrDocs.docs.map( doc => ( { uid: doc.id, ...doc.data( ) } ) )

	// If this is a single document
	return { ...snapOfDocOrDocs.data(), ...( withDocId && { uid: snapOfDocOrDocs.id } ) }

}

exports.log = ( title, content ) => {
	console.log( title, content && JSON.stringify( content, null, process.env.NODE_ENV == 'development' ? 2 : null ) )
}

exports.error = ( title, content ) => {
	console.error( title, content && JSON.stringify( content, null, process.env.NODE_ENV == 'development' ? 2 : null ) )
}