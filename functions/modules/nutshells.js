// Data helpers
const { dataFromSnap, log, error } = require( './helpers' )
const { db, FieldValue, FieldPath } = require( './firebase' )

// ///////////////////////////////
// Demo data
// ///////////////////////////////
const placeholderUid = 'HYmfM9Pkp4S88qJwxuJ1N5q4Igp1'

exports.createTestNutshell = async myUid => {

	try {

		if( !myUid ) throw 'No nutshell or uid provided'

		// Delete old data
		await deleteDemoDataFor( myUid )

		// Get a random user to set the nutshell to
		const [ randomUser ] = await db.collection( 'users' ).where( FieldPath.documentId(), '!=', myUid ).limit( 1 ).get().then( dataFromSnap ) || []

		const tenMinutes = 1000 * 60 * 10
		const nutshell = {
			uid: `testfor-${ myUid }`,
			autoDelete: Date.now() + tenMinutes,
			owner: randomUser.uid,
			created: Date.now(),
			updated: Date.now(),
			published: Date.now(),
			status: 'published',
			entries: [
				{ uid: 1, title: 'test 1', paragraph: 'content 1' },
				{ uid: 2, title: 'test 2', paragraph: 'content 2' }
			]
		}

		// Log out data
		log( `Creatign nutshell testfor-${ myUid }` )

		// Grab my current draft nutshell if there is one
		const [ myDraftNutshell ] = await db.collection( 'nutshells' ).where( 'owner', '==', myUid ).where( 'status', 'in', [ 'draft', 'scheduled' ] ).limit( 1 ).get().then( dataFromSnap ) || []
		

		// Add current draft to my inbox
		if( myDraftNutshell ) {
			const demoBasedOnOwnNutshell = { ...myDraftNutshell, uid: `test-${ myDraftNutshell }`, owner: randomUser.uid }
			await db.collection( 'nutshells' ).doc( demoBasedOnOwnNutshell.uid ).set( demoBasedOnOwnNutshell )
			await db.collection( 'inbox' ).doc( myUid ).set( { nutshells: FieldValue.arrayUnion( demoBasedOnOwnNutshell.uid ) }, { merge: true } )
		}

		// Create test nutshell and add it to my inbox
		await db.collection( 'nutshells' ).doc( nutshell.uid ).set( nutshell )
		await db.collection( 'inbox' ).doc( myUid ).set( { nutshells: FieldValue.arrayUnion( nutshell.uid ) }, { merge: true } )

		log( `Nutshell testfor-${ myUid } created` )

	} catch( e ) {
		log( 'createTestNutshell error: ', e.message || e )
	}

}

const deleteDemoDataFor = async uid => {

	if( !uid ) uid = placeholderUid

	log( `Delete demo data for ${ uid }` )

	await Promise.all( [
		// Delete data of this test
		db.collection( 'nutshells' ).where( 'owner', '==', `testfor-${ uid }` ).get().then( snap => snap.docs.map( doc => doc.ref.delete() ) ),
		// Delete data of incomplete tests
		db.collection( 'nutshells' ).where( 'autoDelete', '<', Date.now() ).get().then( snap => snap.docs.map( doc => doc.ref.delete() ) ),
		// Delete data of this test
		db.collection( 'relationships' ).where( 'owner', '==', `testfor-${ uid }` ).get().then( snap => snap.docs.map( doc => doc.ref.delete() ) ),
		// Delete data of incomplete tests
		db.collection( 'relationships' ).where( 'autoDelete', '<', Date.now() ).get().then( snap => snap.docs.map( doc => doc.ref.delete() ) ),
	] )


}
exports.deleteDemoDataFor = deleteDemoDataFor

// ///////////////////////////////
// Admin checking
// ///////////////////////////////
exports.getScheduledNutshells = async userUid => {


	try {

		const { admin, moderator } = await db.collection( 'specialPowers' ).doc( userUid ).get().then( dataFromSnap )

		if( !admin ) throw `User ${ userUid } is not an admin`

		const nutshells = await db.collection( 'nutshells' ).where( 'status', '==', 'scheduled' ).get().then( dataFromSnap )
		const humanReadable = await Promise.all( nutshells.map( async nutshell => ( {
			...nutshell,
			pusbishAt: new Date( nutshell.published ),
			updatedAt: new Date( nutshell.updated ),
			owner: await db.collection( 'users' ).doc( nutshell.owner ).get().then( dataFromSnap )
		} ) ) )
		
		return humanReadable

	} catch( e ) {
		error( 'scheduledNutshells error: ', e )
	}

}


// ///////////////////////////////
// Publish scheduled Nutshells
// ///////////////////////////////
exports.publish = async f => {

	// Score recomputation module
	const { scoreUser, getContactRecommendations } = require( './recommendations' )

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

		// //////////////////////////////////
		// For every Nutshell send to inbox
		// //////////////////////////////////
		logs.push( 'Sending nutshells to inbox' )

		await Promise.all( nutshells.map( async nutshell => {

				try {

					logs.push( `Parsing ${ nutshell.uid }` )

					// Get the followers of the owner of this Nutshell
					const { followers=[] } = await db.collection( 'userMeta' ).doc( nutshell.owner ).get().then( dataFromSnap )

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
					await db.collection( 'nutshells' ).doc( nutshell.uid ).set( { status: 'published' }, { merge: true } )
						.catch( e => {
							logs.push( `Error marking ${ nutshell.uid } as published` )
							logs.push( e )
							throw e
						} )

					// Recalculate user score after publishing is complete
					logs.push( 'Recomputing score of user' )
					await scoreUser( nutshell.owner )
					logs.push( 'Score recomputed' )

					// Get user recommendations for this user
					logs.push( 'Getting user reccs' )
					await getContactRecommendations( nutshell.owner )
					logs.push( 'Recommendations set' )

				} catch( e ) {

					logs.push( 'Problem parsing nutshell:' )
					logs.push( e )
					throw e

				}

				return

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
