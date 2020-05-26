// Data helpers
const { dataFromSnap, log, error } = require( './helpers' )
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
		if( !queue || queue.length == 0 ) {
			log( 'No nutshells in publishing queue, exiting gracefully' )
			return null
		}

		const nutshells = queue.map( ( { uid, owner } ) => ( { uid, owner } ) )

		// ///////////////////////////////
		// For every nutshell send to inboxed
		// ///////////////////////////////
		return Promise.all( nutshells.map( async nutshell => {

				// Get the followers of the owner of this nutshell
				const { followers } = await db.collection( 'userMeta' ).doc( nutshell.owner ).get().then( dataFromSnap ).catch( f => ( { followers: [] } ) )

				// For every follower, add this nutshell to their inbox
				if( followers && followers.length != 0 ) await Promise.all( followers.map( followerUid => {
					return db.collection( 'inbox' ).doc( followerUid ).set( { nutshells: FieldValue.arrayUnion( nutshell.uid ) }, { merge: true } )
				} ) )

				// Once added to inboxes, mark scheduled
				return db.collection( 'nutshells' ).doc( nutshell.uid ).set( { status: 'published' }, { merge: true } )

		} ) )



	} catch( e ) {
		// If an error occurs, log it and return null
		error( 'Nutshell publishing error: ', JSON.stringify( e, null, 2 ) )
		return null
	}

}