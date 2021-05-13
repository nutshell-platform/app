const { db, FieldValue } = require( './firebase' )
const { dataFromSnap, log, error } = require( './helpers' )
const { sendPushNotifications } = require( './push' )

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
exports.follow = async change => {
	
	try {

		// Ignore deletiona
		if( !change.after.exists ) return null
			
		const { author, follower } = change.after.data()

		// Set following statusses
		await Promise.all( [
			// Remove from author's followers
			db.collection( 'userMeta' ).doc( author ).set( { followers: FieldValue.arrayUnion( follower ) }, { merge: true } ),
			// Remove from follower's following
			db.collection( 'userMeta' ).doc( follower ).set( { following: FieldValue.arrayUnion( author ) }, { merge: true } )
		] )

		// Check if author has push tokens, exit if not
		const { pushTokens=[] } = await db.collection( 'settings' ).doc( author ).get().then( dataFromSnap ) || {}
		if( !pushTokens.length ) return

		// Get the data of the new follower
		const { name, handle } = await db.collection( 'users' ).doc( follower ).get().then( dataFromSnap ) || {}

		// Send push notification to author
		await sendPushNotifications( pushTokens, {
			title: `${ name || handle || 'Someone' } followed you!`,
			body: `Tap to view ${ handle ? `${ handle || name }'s` : 'their' } profile.`,
			data: {
				goto: handle ? `/${ handle }` : '/friends/find'
			}
		} )

	} catch( e ) {
		error( 'Error in follow: ', e )
	}

}