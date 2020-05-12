const { db, FieldValue } = require( './firebase' )

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
exports.follow = change => {
	// Ignore deletiona
	if( !change.after.exists ) return null
		
	const { author, follower } = change.after.data()
	return Promise.all( [
		// Remove from author's followers
		db.collection( 'userMeta' ).doc( author ).set( { followers: FieldValue.arrayUnion( follower ) }, { merge: true } ),
		// Remove from follower's following
		db.collection( 'userMeta' ).doc( follower ).set( { following: FieldValue.arrayUnion( author ) }, { merge: true } )
	] )
}