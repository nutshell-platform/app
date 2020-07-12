const Throttle = require( 'promise-parallel-throttle' )

// Data helpers
const { dataFromSnap, log, error } = require( './helpers' )
const { db, FieldValue } = require( './firebase' )
const { getContactRecommendations } = require( './reccomendations' )

exports.saveFingerprints = async ( data, context ) => {

	const logs = []

	try {

		// Validations
		if( !context.auth ) {
			logs.push( 'No context found, assuming this is a dev environment' )
			context = { ...context, auth: { uid: "HYmfM9Pkp4S88qJwxuJ1N5q4Igp1", token: { email: 'mentor@palokaj.co' } } } // @mentor
		}

		if( !data || data.length == 0 ) throw 'Data is empty or zero'
		
		// Get the user's uid
		const { uid } = context.auth
		const { email } = context.auth.token

		// Write ownership over a fingerprint
		logs.push( 'Writing ownership over fingerprint', email )
		await db.collection( 'fingerprints' ).doc( email ).set( { owners: FieldValue.arrayUnion( uid ) }, { merge: true } )

		// Write fingerprints to database
		logs.push( `Formatting ${ data.length } write entries to database for ${ uid }` )

		// For each fingerprint format a write
		// NOTE: writes is an array of FUNCTIONS not of PROMISES
		const writes = data.map( ( { fingerprint, type } ) => f => {

			// Write to fingerprint database that we are a friend of this fingerprint
			return db.collection( 'fingerprints' ).doc( encodeURIComponent( fingerprint ) ).set( { type: type, friends: FieldValue.arrayUnion( uid ) }, { merge: true } )

		} )

		logs.push( `Writing ${ writes.length } entries to database for ${ uid }` )

		// Make the database write throttled so as to not overheat the database ( firestore limits at 10k/second writes )
		await Throttle.all( writes, {
			maxInProgress: 200,
			progressCallback: ( { amountDone } ) => {
				const progress = 1 - ( ( data.length - amountDone ) / data.length )
				if( progress == .25 || progress == .5 || progress == .75 || progress == 1 ) logs.push( `Wrote ${ progress * 100 }% of contacts` )
			}
		} )

		// Mark meta that we saved contacts
		await db.collection( 'userMeta' ).doc( uid ).set( { contactBookSaved: Date.now() }, { merge: true } )

		// Compute reccs after contact push
		await getContactRecommendations( uid )

		logs.push( `Completed writing fingerprints` )

	} catch( e ) {

		logs.push( 'Fingerprinting error: ', e )

	} finally {

		log( 'Fingerprint logs: ', logs )

	}


	return

}

exports.another = true