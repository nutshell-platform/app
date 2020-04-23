const functions = require('firebase-functions')

const admin = require('firebase-admin')
const app = admin.initializeApp()
const { FieldValue } = app.firestore
const db = app.firestore()

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
	if( !change.after.exists ) return
		
	const { author, follower } = change.after.data()
	return Promise.all( [
		// Remove from author's followers
		db.collection( 'userMeta' ).doc( author ).set( { followers: FieldValue.arrayUnion( follower ) }, { merge: true } ),
		// Remove from follower's following
		db.collection( 'userMeta' ).doc( follower ).set( { following: FieldValue.arrayUnion( author ) }, { merge: true } )
	] )

} )