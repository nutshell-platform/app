const functions = require('firebase-functions')

const admin = require('firebase-admin')
const app = admin.initializeApp()
const { FieldValue } = admin.firestore
const db = app.firestore()

const { dataFromSnap } = require( './modules/helpers' )

// ///////////////////////////////
// On relation create IN PROGRESS
// ///////////////////////////////
exports.unFollow = functions.firestore.document( 'relationships/{relationId}' ).onDelete( ( snap, context ) => {

	const { author, follower } = snap.data()
	return Promise.all( [
		// Remove from author's followers
		db.collection( 'userMeta' ).doc( author ).set( { followers: FieldValue.arrayRemove( follower ) }, { merge: true } ),
		// Remove from follower's following
		db.collection( 'userMeta' ).doc( follower ).set( { following: FieldValue.arrayRemove( author ) }, { merge: true } )
	] )

} )

exports.follow = functions.firestore.document( 'relationships/{relationId}' ).onWrite( ( change, context ) => {

	// Ignore deletiona
	if( !change.after.exists ) return null
		
	const { author, follower } = change.after.data()
	return Promise.all( [
		// Remove from author's followers
		db.collection( 'userMeta' ).doc( author ).set( { followers: FieldValue.arrayUnion( follower ) }, { merge: true } ),
		// Remove from follower's following
		db.collection( 'userMeta' ).doc( follower ).set( { following: FieldValue.arrayUnion( author ) }, { merge: true } )
	] )

} )

// ///////////////////////////////
// Cron
// ///////////////////////////////
exports.publish = functions.pubsub.runWith( { timeoutSeconds: 540, memory: '2GB' } ).schedule( 'every 1 hours' ).onRun( async context => {

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

} )