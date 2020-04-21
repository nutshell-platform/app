const functions = require('firebase-functions')

const admin = require('firebase-admin')
admin.initializeApp()
const db = admin.firestore()

// ///////////////////////////////
// On relation create IN PROGRESS
// ///////////////////////////////
// exports.modifyUser = functions.firestore.document( 'relationships/{relationId}' ).onWrite( ( change, context ) => {

// 	const before = change.before.exists ? { id: change.before.id, ...change.before.data() } : null
// 	const { follower, author } = before

// 	const after  = change.after.exists ? { id: change.after.id, ...change.after.data() } : null

// 	// If change was a deletion, delete the relevant references
// 	if( !after ) {
// 		return Promise.all( [
// 			db.collection( 'userMeta' ).doc( author ),
// 			db.collection( 'userMeta' ).doc( doc.id ).delete()
// 		] )
// 	}



// } )