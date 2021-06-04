const { db, FieldValue } = require( './firebase' )
const { dataFromSnap, log, error } = require( './helpers' )
const { sendPushNotificationsByUserUid } = require( './push' )

// ( snap, context ) =>
exports.unfollow = snap => {
	const { author, follower } = snap.data()
	return Promise.all( [
		// Remove from author's followers
		db.collection( 'userMeta' ).doc( author ).set( { followers: FieldValue.arrayRemove( follower ) }, { merge: true } ),
		// Remove from follower's following
		db.collection( 'userMeta' ).doc( follower ).set( { following: FieldValue.arrayRemove( author ) }, { merge: true } )
	] )
}

// ( change, context ) =>
exports.follow = async ( change, context ) => {
	
	try {

		// Ignore deletions
		if( !change.after.exists ) return null
			
		const { author, follower, confirmed } = change.after.data()

		// If after write it is not confirmed, this was a system marking
		if( confirmed === false ) return null

		// Get account type and set relation status if needed
		const { privateProfile } = await db.collection( 'settings' ).doc( author ).get().then( dataFromSnap )
		if( privateProfile ) await db.collection( 'relationships' ).doc( context.params.relationId ).set( { confirmed: false }, { merge: true } )

		// Set following statusses
		if( !privateProfile ) await Promise.all( [
			// Remove from author's followers
			db.collection( 'userMeta' ).doc( author ).set( { followers: FieldValue.arrayUnion( follower ) }, { merge: true } ),
			// Remove from follower's following
			db.collection( 'userMeta' ).doc( follower ).set( { following: FieldValue.arrayUnion( author ) }, { merge: true } )
		] )

		if( privateProfile ) await Promise.all( [
			// Remove from author's followers
			db.collection( 'userMeta' ).doc( author ).set( { unconfirmedFollowers: FieldValue.arrayUnion( follower ) }, { merge: true } ),
			// Remove from follower's following
			db.collection( 'userMeta' ).doc( follower ).set( { requestedFollows: FieldValue.arrayUnion( author ) }, { merge: true } )
		] )

		// Check if author has push tokens, and wants to get notified, exit if not
		const { pushTokens=[], notifications={} } = await db.collection( 'settings' ).doc( author ).get().then( dataFromSnap ) || {}
		if( !notifications.newFollower || !pushTokens.length ) return

		// Get the data of the new follower
		const { name, handle } = await db.collection( 'users' ).doc( follower ).get().then( dataFromSnap ) || {}

		// Send push notification to author
		await sendPushNotificationsByUserUid( author, {
			title: `${ name || handle || 'Someone' } ${ privateProfile ? `requested to follow` : `followed` } you!`,
			body: `Tap to view ${ handle ? `${ `@${ handle }` || name }'s` : 'their' } profile.`,
			data: {
				goto: handle ? `/${ handle }` : '/friends/find'
			}
		} )

	} catch( e ) {
		error( 'Error in follow: ', e )
	}

}

exports.makePrivate = async ( change, context ) => {

	try {

		// Ignore deletions and things other than account privacy
		if( !change.after.exists ) return null

		// If profile is not private or already was private, ignore
		const { privateProfile } = change.after.data()
		const { privateProfile: oldPrivacySetting } = change.before.data()
		if( !privateProfile || oldPrivacySetting == privateProfile ) return null

		// Move all relationships (delete old, make new)
		const { userUid } = context.params

		// Get relationships
		const relationships = await db.collection( 'relationships' ).where( 'author', '==', userUid ).get().then( dataFromSnap )

		// Set relationships to unconfirmed
		await Promise.all( relationships.map( ( { uid, ...relationship } ) => {
			return db.collection( 'relationships' ).doc( uid ).set( {
				confirmed: false
			}, { merge: true } )
		} ) )

		// Reset follower array but add unconfirmed array
		await db.collection( 'userMeta' ).doc( userUid ).set( {
			followers: [],
			unconfirmedFollowers: relationships.map( ( { follower } ) => follower )
		}, { merge: true } )

	} catch( e ) {
		error( 'error in makePrivate: ', e )
	}
}