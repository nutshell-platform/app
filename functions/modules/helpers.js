const dataFromSnap = ( snapOfDocOrDocs, withDocId=true ) => {

	// If these are multiple docs
	if( snapOfDocOrDocs.docs ) return snapOfDocOrDocs.docs.map( doc => ( { uid: doc.id, ...doc.data( ) } ) )

	// If this is a single document
	return { ...snapOfDocOrDocs.data(), ...( withDocId && { uid: snapOfDocOrDocs.id } ) }

}

const log = ( title, content ) => {
	console.log( title, content && JSON.stringify( content, null, process.env.NODE_ENV == 'development' ? 2 : 0 ) )
}

module.exports = {
	dataFromSnap: dataFromSnap,
	log: log
}