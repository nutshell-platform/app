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
		logs.push( 'Writing score to user meta' )
		await db.collection( 'userMeta' ).doc( uid ).set( { score: score }, { merge: true } )

		logs.push( 'Wrote score to user' )


	} catch( e ) {
		logs.push( `User score error: `, e )
	} finally {
		log( `User scoring log: `, logs )
	}

	return

}

exports.another = true