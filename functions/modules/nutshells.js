// Data helpers
const { dataFromSnap, log, error } = require( './helpers' )
const { db, FieldValue } = require( './firebase' )

// ///////////////////////////////
// Demo data
// ///////////////////////////////
exports.makeDemo = async f => {

	const nutshells = [ 1,2,3,4,5 ]

	try {
		await Promise.all( nutshells.map( nutshell => {

			return db.collection( 'nutshells' ).add( {
				created: Date.now(),
				owner: 'bHOwM0nKgPNMet0JGMCczdbfIrz2', // Derpface
				published: Date.now(),
				status: 'scheduled',
				updated: Date.now(),
				entries: [
					{ uuid: Math.random(), title: 'Demo', paragraph: 'Hello' }
				]
			} )

		} ) )

		console.log( 'Creation success' )

	} catch( e ) {
		console.log( 'creation problem, ', e )
	}

}


// ///////////////////////////////
// Publish scheduled Nutshells
// ///////////////////////////////
exports.publish = async f => {

	const runLog = []

	try {

		// ///////////////////////////////
		// Get Nutshells scheduled for the pase
		// ///////////////////////////////
		runLog.push( 'Getting nutshell queue' )
		const queue = await db.collection( 'nutshells' ).where( 'status', '==', 'scheduled' ).where( 'published', '<=', Date.now() ).get().then( dataFromSnap )
		runLog.push( `Got ${ queue.length } nutshells` )
		if( !queue || queue.length == 0 ) {
			log( 'No Nutshells in publishing queue, exiting gracefully' )
			return null
		}

		const nutshells = queue.map( ( { uid, owner } ) => ( { uid, owner } ) )

		// ///////////////////////////////
		// For every Nutshell send to inboxed
		// ///////////////////////////////
		runLog.push( 'Sending nutshells to inbox' )

		await Promise.all( nutshells.map( async nutshell => {

				try {

					runLog.push( `Parsing ${ nutshell.uid }` )

					// Get the followers of the owner of this Nutshell
					const { followers } = await db.collection( 'userMeta' ).doc( nutshell.owner ).get().then( dataFromSnap )

					runLog.push( `Nutshell ${ nutshell.uid } has ${ followers && followers.length } followers` )

					// For every follower, add this Nutshell to their inbox
					if( followers && followers.length != 0 ) await Promise.all( followers.map( followerUid => {
						return db.collection( 'inbox' ).doc( followerUid ).set( { nutshells: FieldValue.arrayUnion( nutshell.uid ) }, { merge: true } )
							.catch( e => {
								runLog.push( `Error adding ${ nutshell.uid } to inbox of ${ followerUid }` )
								runLog.push( e )
								throw e
							} )
					} ) )

					// Once added to inboxes, mark published
					runLog.push(  `Marking nutshell ${ nutshell.uid } as read` )
					return db.collection( 'nutshells' ).doc( nutshell.uid ).set( { status: 'published' }, { merge: true } )
						.catch( e => {
							runLog.push( `Error marking ${ nutshell.uid } as read` )
							runLog.push( e )
							throw e
						} )

				} catch( e ) {

					log.push( 'Problem parsing nutshell:' )
					log.push( e )
					throw e

				}

		} ) )



	} catch( e ) {
		// If an error occurs, log it and return null
		error( 'Nutshell publishing error: ', JSON.stringify( e, null, 2 ) )
		return null
	} finally {
		log( 'Publishing logs: ', runLog )
	}

}

// ( snap, context ) =>
exports.deleteFromUnboxesOnNutshellDelete = async ( snap, context ) => {
	const { nutshellUid } = context.params
	const { owner } = snap.data()

	try {

		// Grab all the followers of this user
		const followerRelations = await db.collection( 'relationships' ).where( 'follower', '==', owner ).get().then( dataFromSnap )
		if( !followerRelations || followerRelations.length == 0 ) return null

		// For each loader update the inbox to no longer have this Nutshell
		await Promise.all( followerRelations.map( ( { follower } ) => {
			return db.collection( 'inbox' ).doc( follower ).set( { nutshells: FieldValue.arrayRemove( nutshellUid ) }, { merge: true } ).catch( e => error( `Error marking nutshell ${ nutshellUid } read for ${ follower }: `, e ) )
		} ) )

	} catch( e ) {
		error( 'Error deleting Nutshell from inboxes after it was deleted: ', e )
	}
}
