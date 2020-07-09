// Data helpers
const { dataFromSnap, log, error } = require( './helpers' )
const { db, FieldValue } = require( './firebase' )

// ///////////////////////////////
//  Show queue
// ///////////////////////////////
exports.showQueue = async ( req, res ) => {
	if( req.query.secret != 42 ) return res.send( 'Invalid authentication' )
	try {
		const nutshells = await scheduledNutshells( !!req.query.all )
		return res.send( nutshells )
	} catch( e ) {
		return res.send( { error: e } )
	}
}

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
// Admin checking
// ///////////////////////////////
exports.scheduledNutshells = async all => {
	
	try {
		const nutshells = await ( all ? db.collection( 'nutshells' ).get().then( dataFromSnap ) : db.collection( 'nutshells' ).where( 'status', '==', 'scheduled' ).get().then( dataFromSnap ) )
		const humanReadable = await Promise.all( nutshells.map( async nutshell => ( {
			...nutshell,
			pusbishAt: new Date( nutshell.published ),
			updatedAt: new Date( nutshell.updated ),
			owner: await db.collection( 'users' ).doc( nutshell.owner ).get().then( dataFromSnap )
		} ) ) )
		return humanReadable
	} catch( e ) {
		throw e
	}

}


// ///////////////////////////////
// Publish scheduled Nutshells
// ///////////////////////////////
exports.publish = async f => {

	const logs = []

	try {

		// ///////////////////////////////
		// Get Nutshells scheduled for the pase
		// ///////////////////////////////
		logs.push( 'Getting nutshell queue' )
		const queue = await db.collection( 'nutshells' ).where( 'status', '==', 'scheduled' ).where( 'published', '<=', Date.now() ).get().then( dataFromSnap )
		logs.push( `Got ${ queue.length } nutshells` )
		if( !queue || queue.length == 0 ) return logs.push( 'No Nutshells in publishing queue, exiting gracefully' )

		const nutshells = queue.map( ( { uid, owner } ) => ( { uid, owner } ) )

		// ///////////////////////////////
		// For every Nutshell send to inboxed
		// ///////////////////////////////
		logs.push( 'Sending nutshells to inbox' )

		await Promise.all( nutshells.map( async nutshell => {

				try {

					logs.push( `Parsing ${ nutshell.uid }` )

					// Get the followers of the owner of this Nutshell
					const { followers } = await db.collection( 'userMeta' ).doc( nutshell.owner ).get().then( dataFromSnap )

					logs.push( `Nutshell ${ nutshell.uid } has ${ followers && followers.length } followers` )

					// For every follower, add this Nutshell to their inbox
					if( followers && followers.length != 0 ) await Promise.all( followers.map( followerUid => {
						return db.collection( 'inbox' ).doc( followerUid ).set( { nutshells: FieldValue.arrayUnion( nutshell.uid ) }, { merge: true } )
							.catch( e => {
								logs.push( `Error adding ${ nutshell.uid } to inbox of ${ followerUid }`, e )
								throw e
							} )
					} ) )

					// Once added to inboxes, mark published
					logs.push(  `Marking nutshell ${ nutshell.uid } as published` )
					return db.collection( 'nutshells' ).doc( nutshell.uid ).set( { status: 'published' }, { merge: true } )
						.catch( e => {
							logs.push( `Error marking ${ nutshell.uid } as published` )
							logs.push( e )
							throw e
						} )

				} catch( e ) {

					logs.push( 'Problem parsing nutshell:' )
					logs.push( e )
					throw e

				}

		} ) )

		logs.push( 'Nutshell publishing completed gracefully' )



	} catch( e ) {
		// If an error occurs, log it and return null
		error( 'Nutshell publishing error: ', e )
	} finally {
		log( 'Publishing logs: ', logs )
	}

}

// ( snap, context ) =>
exports.deleteFromInboxesOnNutshellDelete = async ( snap, context ) => {
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
