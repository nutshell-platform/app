// Data helpers
const { dataFromSnap, log, error } = require( './helpers' )
const { db, FieldValue } = require( './firebase' )

exports.scoreUser = async uid => {

	const logs = []

	try {

		logs.push( `Getting data for ${ uid }` )
		const { bio, avatar } = await db.collection( 'users' ).doc( uid ).get().then( dataFromSnap )
		const { followers, following } = await db.collection( 'userMeta' ).doc( uid ).get().then( dataFromSnap )

		logs.push( 'Computing score' )
		let score = 0


		// Has set their settings
		if( bio ) score += 1
		if( avatar ) score += 1

		// Only give extra weight to those with both a bio and image
		if( bio && avatar ) {

			// Has over 10 followers
			if( followers && ( followers.length > 10 ) ) score += 1

			// Follower excess points
			if( ( followers && following ) && ( followers.length - following.length ) > 0 ) score += ( followers.length / 100 )

			// Positive followers ratio
			if( ( followers && following ) && ( followers.length / following.length  ) > 1 ) score += 1

		}

		logs.push( `Score determined as ${ score }` )

		// Write score to user
		logs.push( 'Writing score to user and user meta' )
		await Promise.all( [
			db.collection( 'userMeta' ).doc( uid ).set( { score: score }, { merge: true } ),
			db.collection( 'users' ).doc( uid ).set( { score: score }, { merge: true } )
		] )

		logs.push( 'Wrote score to user' )


	} catch( e ) {
		logs.push( `User score error: `, e )
	} finally {
		log( `User scoring log: `, logs )
	}

	return

}

exports.getContactRecommendations = async uid => {

	const logs = []

	try {

		// ///////////////////////////////
		// Social graph recommendations
		// ///////////////////////////////

		// Get user's meta
		logs.push( 'Getting user follow list and followers' )
		let { following, followers, muted, blocked } = await db.collection( 'userMeta' ).doc( uid ).get().then( dataFromSnap )
		const personaNonGrata = [ ...muted, ...blocked, uid ]

		// Make sure both are arrays
		following = following.length ? following : []
		followers = followers.length ? followers : []

		// Get second degree
		logs.push( 'Get meta of followers and followees' )
		const secondDegree = await Promise.all( [ ...followers, ...following ].map( uid => db.collection( 'userMeta' ).doc( uid ).get().then( dataFromSnap ) ) )

		// Transform into persons of interest
		logs.push( 'Transforming second degree into single list that excludes blocked and muted people' )
		let personsOfInterest = secondDegree.filter( ( { uid } ) => !personaNonGrata.includes( uid ) ).map( ( { followers=[], following=[] } ) => [ ...followers, ...following ] )

		// Flatten in node 10 without .flat()
		personsOfInterest = [].concat.apply( [], personsOfInterest )

		logs.push( 'Making a ranked object' )
		const rankedPersons = {}
		for ( let i = personsOfInterest.length - 1; i >= 0; i-- ) {
			// If this person was registered already, increment
			if( rankedPersons[ personsOfInterest[i] ] ) rankedPersons[ personsOfInterest[i] ] += 1
			else rankedPersons[ personsOfInterest[i] ] = 1
		}

		// Change ranked object to array
		logs.push( 'Making a ranked array' )
		let rankedArray = Object.keys( rankedPersons ).map( uid => ( { uid: uid, rank: rankedPersons[ uid ] } ) )

		logs.push( 'DOing sorting operations' )
		// Sort by rank
		rankedArray.sort( ( a, b ) => b.rank - a.rank )

		// // Change object list to ID list
		rankedArray = rankedArray.map( item => item.uid )

		// Limit the recommendation length
		rankedArray = rankedArray.slice( 0, 10 )

		// Write recommendations
		logs.push( 'Sending graph links to database', rankedArray )
		await db.collection( 'userMeta' ).doc( uid ).set( { recommendations: FieldValue.arrayUnion( ...rankedArray ) }, { merge: true } )

		// ///////////////////////////////
		// Contact based recommendations
		// ///////////////////////////////

		const [ iKnowThem, theyKnowMe ] = await Promise.all( [
			// Grab finterprints where I am a friend of a fingerprint, ie they are in my contactbook, sort limits to entries with an owner
			db.collection( 'fingerprints' ).where( 'friends', 'array-contains', uid ).orderBy( 'owners', 'desc' ).get().then( dataFromSnap ).catch( f => ( { owners: [] } ) ),

			// Grab fingerprint claimed by me, but only if it has friends
			db.collection( 'fingerprints' ).where( 'owners', 'array-contains', uid ).orderBy( 'friends' ).get().then( dataFromSnap ).catch( f => ( { friends: [] } ) )

		] )

		const contactLinks = [ ...iKnowThem.owners, ...theyKnowMe.friends ]

		logs.push( 'Sending contact links to database', contactLinks )
		if( contactLinks.length > 0 ) await db.collection( 'userMeta' ).doc( uid ).set( { recommendations: FieldValue.arrayUnion( ...contactLinks ) }, { merge: true } )

	} catch( e ) {
		logs.push( 'Recommendation error: ', e )
	} finally {
		log( 'Recommendation logs: ', logs )
	}

	return

}