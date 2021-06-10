const { db, FieldValue } = require( './firebase' )
const { dataFromSnap, log, error } = require( './helpers' )
const { sendPushNotificationsByUserUid } = require( './push' )

exports.addMultipleTestFollowers = async myUid => {


	try {

		// Grab highest scoring users
		const users = await db.collection( 'userMeta' ).orderBy( 'score', 'desc' ).limit( 5 ).get().then( dataFromSnap )
		const userUids = users.map( ( { uid } ) => uid ).filter( uid => uid != myUid )

		// Create relationships for me and these users
		await Promise.all( userUids.map( uid => db.collection( 'relationships' ).add( {
			follower: uid,
			author: myUid,
			updated: Date.now(),
			autoDelete: Date.now() + ( 1000 * 60 * 15 ),
			owner: `testfor-${ myUid }`
		} ) ) )

	} catch( e ) {
		error( 'haveSomeoneFollowMe error: ', e )
	}

}

// ( snap, context ) =>
exports.unfollow = snap => {
	const { author, follower } = snap.data()
	return Promise.all( [
		// Remove from author's followers
		db.collection( 'userMeta' ).doc( author ).set( {
			unconfirmedFollowers: FieldValue.arrayRemove( follower ),
			followers: FieldValue.arrayRemove( follower )
		}, { merge: true } ),
		// Remove from follower's following
		db.collection( 'userMeta' ).doc( follower ).set( {
			requestedFollows: FieldValue.arrayRemove( author ),
			following: FieldValue.arrayRemove( author )
		}, { merge: true } )
	] )
}

// ( change, context ) =>
exports.follow = async ( change, context ) => {
	
	try {

		// Ignore deletions
		if( !change.after.exists ) return null
			
		let { author, follower, confirmed, ignored, silent } = change.after.data()
		const { ignored: prevIgnored } = change.before.data() || {}

		// ///////////////////////////////
		// Automatic tagging
		// ///////////////////////////////

		// If this was a new ignore, remove from user array
		if( !prevIgnored && ignored ) await db.collection( 'userMeta' ).doc( author ).set( {
			unconfirmedFollowers: FieldValue.arrayRemove( follower )
		}, { merge: true } )

		// If after write it is not confirmed, this was a system marking
		if( confirmed === false ) return null

		// Get account type and set relation status if needed
		const { privateProfile } = await db.collection( 'settings' ).doc( author ).get().then( dataFromSnap )
		if( privateProfile || confirmed === undefined ) {
			// Set confirmed to false, also set it so this function knows it
			await db.collection( 'relationships' ).doc( context.params.relationId ).set( { confirmed: false }, { merge: true } )
			confirmed = false
		}

		// ///////////////////////////////
		// If this was a new creation
		// Update the userMeta trackers
		// ///////////////////////////////

		// PUBLIC: Set following statusses
		if( !privateProfile ) await Promise.all( [
			db.collection( 'userMeta' ).doc( author ).set( { followers: FieldValue.arrayUnion( follower ) }, { merge: true } ),
			db.collection( 'userMeta' ).doc( follower ).set( { following: FieldValue.arrayUnion( author ) }, { merge: true } )
		] )

		// PRIVATE && UNCONFIRMED: update following statuses
		if( privateProfile && !confirmed ) await Promise.all( [
			// Add to unconfirmedFollowers and requestedFollowers
			db.collection( 'userMeta' ).doc( author ).set( { unconfirmedFollowers: FieldValue.arrayUnion( follower ) }, { merge: true } ),
			db.collection( 'userMeta' ).doc( follower ).set( { requestedFollows: FieldValue.arrayUnion( author ) }, { merge: true } )
		] )

		// PRIVATE && CONFIRMED: update following statuses
		if( privateProfile && confirmed ) await Promise.all( [
			// Remove from unconfirmed/requested and add to following/followers
			db.collection( 'userMeta' ).doc( author ).set( {
				unconfirmedFollowers: FieldValue.arrayRemove( follower ),
				followers: FieldValue.arrayUnion( follower )
			}, { merge: true } ),
			db.collection( 'userMeta' ).doc( follower ).set( {
				requestedFollows: FieldValue.arrayRemove( author ),
				following: FieldValue.arrayUnion( author )
			}, { merge: true } )
		] )

		// ///////////////////////////////
		// Push notificatioin handler
		// ///////////////////////////////

		// If this is a demo user, do not send notis
		if( silent ) return null

		// Exit if this profile is unconfirmed and private
		if( privateProfile && !confirmed ) return null

		// Check if author has push tokens, and wants to get notified, exit if not
		const { pushTokens=[], notifications={} } = await db.collection( 'settings' ).doc( author ).get().then( dataFromSnap ) || {}
		if( !notifications.newFollower || !pushTokens.length ) return null

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

		// The change is not a privacy change == exit
		if( oldPrivacySetting == privateProfile ) return null

		// Move all relationships (delete old, make new)
		const { userUid } = context.params

		// Account was opened up
		if( !privateProfile ) {
			const meta = await db.collection( 'userMeta' ).doc( userUid ).get().then( dataFromSnap )
			await db.collection( 'userMeta' ).doc( userUid ).set( {
				privateProfile: false,
				recommendations: FieldValue.arrayUnion( ...meta.unconfirmedFollowers )
			}, { merge: true } )
		}

		// Account was closed down
		if( privateProfile ) {
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
				privateProfile: true,
				followers: [],
				unconfirmedFollowers: relationships.map( ( { follower } ) => follower )
			}, { merge: true } )
		}

	} catch( e ) {
		error( 'error in makePrivate: ', e )
	}
}