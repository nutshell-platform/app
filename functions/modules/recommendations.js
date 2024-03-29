// Data helpers
const { dataFromSnap, log, error } = require( './helpers' )
const { db, FieldValue } = require( './firebase' )

exports.refreshAllReccsAndScores = async ( data={}, context={} ) => {



	try {

		// Validate requesting user
		const { uid } = context.auth
		if( !uid ) throw 'User not logged in'
		const { admin } = await db.collection( 'specialPowers' ).doc( uid ).get().then( dataFromSnap )
		if( !admin ) {
			throw 'You do not have permission to send push notifications, your action has been reported to the admins.'
		}

		// Score all users and refresh all reccs
		const users = await db.collection( 'userMeta' ).get().then( dataFromSnap )
		await Promise.all( users.map( ( { uid } ) => scoreUser( uid ) ) )
		await Promise.all( users.map( ( { uid } ) => getContactRecommendations( uid ) ) )

	} catch( e ) {
		error( e )
	}

}


const scoreUser = async uid => {

	const logs = []

	try {

		logs.push( `Getting data for ${ uid }` )
		const { name, bio, avatar } = await db.collection( 'users' ).doc( uid ).get().then( dataFromSnap )
		const { followers, following } = await db.collection( 'userMeta' ).doc( uid ).get().then( dataFromSnap )

		logs.push( 'Computing score' )
		let score = 0


		// ///////////////////////////////
		// Scoring algorothm
		// ///////////////////////////////
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

		// ///////////////////////////////
		// Algorithm overrides
		// ///////////////////////////////
		if( !name ) score = 0

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
exports.scoreUser = scoreUser


const getContactRecommendations = async uid => {

	const logs = []

	try {

		// ///////////////////////////////
		// Social graph recommendations
		// ///////////////////////////////

		// Get user's meta
		logs.push( 'Getting user follow list, recommendations and followers' )
		let { recommendations=[], following=[], followers=[], muted=[], blocked=[], neverRecommend=[] } = await db.collection( 'userMeta' ).doc( uid ).get().then( dataFromSnap )
		
		// Ignore yourself, muted people, blocked people and preople you already follow
		const personaNonGrata = [ ...muted, ...blocked, ...following, ...neverRecommend, uid ]
		logs.push( 'Persona non grata: ', personaNonGrata )

		// If the recommendations are over 20, scratch the recc log since it is bad UX
		if( recommendations.length > 20 ) await db.collection( 'userMeta' ).doc( uid ).set( { recommendations: [] }, { merge: true } )

		// ///////////////////////////////
		// Remove persona non grata from current recommendations
		// (in case blocked, muted or follows updated since last run)
		// ///////////////////////////////

		// Find people to unrecommend, these are current recs in the persona non grata array
		const unRecommendThesePeople = recommendations.filter( reccedUid => personaNonGrata.includes( reccedUid ) )
		logs.push( `Unrecommending ${ unRecommendThesePeople.length } people` )
		if( unRecommendThesePeople.length != 0 ) await db.collection( 'userMeta' ).doc( uid ).set( { recommendations: FieldValue.arrayRemove( ...unRecommendThesePeople ) }, { merge: true } )
		// await Promise.all( unRecommendThesePeople.map( uidToUnrec => db.collection( 'userMeta' ).doc( uid ).set( { recommendations: FieldValue.arrayRemove( uidToUnrec ) }, { merge: true } ) ) )


		// ///////////////////////////////
		// Recc algo
		// ///////////////////////////////
		// Get second degree
		logs.push( 'Get meta of followers and followees' )
		let secondDegree = await Promise.all( [ ...followers, ...following ].map( uid => db.collection( 'userMeta' ).doc( uid ).get().then( dataFromSnap ) ) )

		// Remove users with score 0 or no score
		secondDegree = secondDegree.filter( ( { score } ) => !!score )

		// Transform into persons of interest ( array of users )
		logs.push( 'Transforming second degree into single list that excludes blocked and muted people.' )

		// Make persons of interest into an array
		let personsOfInterest = secondDegree.map( ( { uid, followers=[], following=[] } ) => [ ...followers, ...following, uid ] )

		// Flatten in node 10 without .flat()
		personsOfInterest = [].concat.apply( [], personsOfInterest )

		// Filter out persona non grata
		personsOfInterest = personsOfInterest.filter( uid => !personaNonGrata.includes( uid ) )
		logs.push( 'Persons of interest: ', personsOfInterest )

		// ///////////////////////////////
		// Rank the persons of interest
		// ///////////////////////////////		

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
		if( rankedArray.length > 0 ) await db.collection( 'userMeta' ).doc( uid ).set( { recommendations: rankedArray }, { merge: true } )

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

exports.getContactRecommendations = getContactRecommendations