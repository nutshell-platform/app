// Data helpers
const { dataFromSnap } = require( './helpers' )
const { db, FieldValue } = require( './firebase' )

// ///////////////////////////////
// Publish scheduled nutshells
// ///////////////////////////////
exports.publish = async f => {

	try {

		// ///////////////////////////////
		// Get nutshells scheduled for the pase
		// ///////////////////////////////
		const queue = await db.collection( 'nutshells' ).where( 'status', '==', 'scheduled' ).where( 'published', '<=', Date.now() ).get().then( dataFromSnap )
		if( queue.length == 0 ) return null
		const nutshells = queue.map( ( { uid, owner } ) => ( { uid, owner } ) )

		// ///////////////////////////////
		// For every nutshell send to inboxed
		// ///////////////////////////////
		await Promise.all( nutshells.map( async nutshell => {

			try {

				// Get the followers of the owner of this nutshell
				const { followers } = await db.collection( 'userMeta' ).doc( nutshell.owner ).get().then( dataFromSnap )

				// For every follower, add this nutshell to their inbox
				return Promise.all( followers.map( followerUid => {
					return db.collection( 'inbox' ).doc( followerUid ).set( { nutshells: FieldValue.arrayUnion( nutshell.uid ) }, { merge: true } )
				} ) )

			} catch( e ) {
				throw e
			}

		} ) )

		// ///////////////////////////////
		// Update nutshell status
		// ///////////////////////////////
		await Promise.all( nutshells.map( ( { uid } ) => db.collection( 'nutshells' ).doc( uid ).update( { status: 'published' } ) ) )


	} catch( e ) {
		// If an error occurs, log it and return null
		console.error( 'Nutshell publishing error: ', JSON.stringify( e, null, 2 ) )
		return null
	}

}