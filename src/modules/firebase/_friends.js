import { dataFromSnap, hash } from './helpers'
import { uniqueByProp, error, log } from '../helpers'

export const addMultipleTestFollowers = app => {

	// Get funcs and data
	const { func } = app
	const doAddMultipleTestFollowers = func.httpsCallable( 'addMultipleTestFollowers' )

	// Generare recommendations
	return doAddMultipleTestFollowers().then( f => alert( 'Follower addition success' ) ).catch( e => alert( `Fail ${ e.message }` ) )

}

// Find people and filter out myself
export const getRandomPeople = async app => {

	const searchLimit = 50

	// Get scored users
	let users = await app.db.collection( 'users' ).orderBy( 'score', 'desc' ).limit( searchLimit ).get().then( dataFromSnap )

	// If there are not enough scored users, get unscored ones to fill them up
	if( users.length < searchLimit ) {
		log( `Only ${ users.length } scored users found, finding unscored users` )
		const unscoredUsers = await app.db.collection( 'users' ).limit( searchLimit - users.length ).get().then( dataFromSnap )
		users = [ ...users, ...unscoredUsers  ]
	}

	// Sort by score and/or relevance
	users.sort( ( a, b ) => {

		// If one has a score, use it to compute order
		if( a.score || b.score ) return b.score - a.score

		// If neither has score favor those with avatar
		if( a.avatar && !b.avatar ) return -1
		if( !a.avatar && b.avatar ) return 1

		return 0

	} )

	// Add user meta to the data
	users = await Promise.all( users.map( async user => ( {
		...user,
		...( await app.db.collection( 'userMeta' ).doc( user.uid ).get().then( dataFromSnap ) )
	} ) ) )

	// Return all that are not self
	return users.filter( friend => friend.uid != app.auth.currentUser?.uid )

}

// ///////////////////////////////
// Following
// ///////////////////////////////
export const followPerson = ( app, theirUid ) => {
	const { currentUser } = app.auth
	log( `Following ${ theirUid } on behalf of ${ currentUser?.uid }` )

	return app.db.collection( 'relationships' ).add( {
		follower: currentUser?.uid,
		author: theirUid,
		// Make sure test user follows silently
		...( currentUser.email?.includes( 'testymctestface' ) && { silent: true } ),
		updated: Date.now()
	} )
}

export const unfollowPerson = ( app, theirUid ) => {
	const { currentUser } = app.auth
	log( `Unfollowing ${ theirUid } on behalf of ${ currentUser?.uid }` )
	return app.db.collection( 'relationships' )
	.where( 'follower', '==', currentUser.uid )
	.where( 'author', '==', theirUid )
	.get()
	.then( snap => snap.docs.map( doc => doc.ref.delete() ) )
}

export const blockPerson = ( app, theirUid ) => {
	const { db, auth, FieldValue } = app
	const { currentUser } = auth
	return db.collection( 'userMeta' ).doc( currentUser.uid ).set( { blocked: FieldValue.arrayUnion( theirUid ) }, { merge: true } )
}

export const unblockPerson = ( app, theirUid ) => {
	const { db, auth, FieldValue } = app
	const { currentUser } = auth
	return db.collection( 'userMeta' ).doc( currentUser.uid ).set( { blocked: FieldValue.arrayRemove( theirUid ) }, { merge: true } )
}


// ///////////////////////////////
// Getching
// ///////////////////////////////
export const findPerson = async ( app, query ) => {

	// const { currentUser } = app.auth
	// const isEmail = query.match( /[\w-]+?@{1}[\w-]+?[\w\.]+/ )
	// const readProfile = ( { uid } ) => app.db.collection( 'users' ).doc( uid ).get().then( dataFromSnap )
	// const notMe = users => users.filter( ( { uid } ) => uid != currentUser.uid )

	// Sanetise ( trim )
	query = query[0] == '@' ? query.substring( 1 ).trim() : query.trim()

	try {

		// Algolia searches
		const algoliaSearch = app.func.httpsCallable( 'searchAlgoliaAccountEntries' )
		const { data: algoliaMatches } = await algoliaSearch( query )
		log( 'Algolia hits: ', algoliaMatches?.hits?.map( hit => ( { ...hit, uid: hit.objectID } ) ) )
		return algoliaMatches?.hits?.map( ( { objectID, ...hit } ) => ( { ...hit, uid: objectID } ) ) || []

	} catch( e ) {
		error( 'findPerson error: ', e )
		return []
	}

}

export const getPerson = async ( db, query, by ) => {

	let user
	if( by == 'uid' ) user = await db.collection( 'users' ).doc( query ).get().then( dataFromSnap )
	else user = await db.collection( 'users' ).where( by, '==', query ).get().then( dataFromSnap ).then( hits => hits[0] || {} )
	if( !user.uid ) throw 'User not found'
	const meta = await db.collection( 'userMeta' ).doc( user.uid ).get().then( dataFromSnap )
	return { ...user, ...meta }


}

export const getContactRecommendations = async app => {

	// Get funcs and data
	const { func } = app
	const getRecs = func.httpsCallable( 'getContactRecommendations' )

	// Generare recommendations
	return getRecs()

}

export const unrecommendPerson = async ( app, uidToUnrecommend ) => {

	// Get current user
	const { auth: { currentUser }, db, FieldValue } = app

	return db.collection( 'userMeta' ).doc( currentUser.uid ).set( { recommendations: FieldValue.arrayRemove( uidToUnrecommend ) }, { merge: true } )

}

export const ignoreRecommendation = async ( app, uidToIgnore ) => {

	// Get current user
	const { auth: { currentUser }, db, FieldValue } = app

	return db.collection( 'userMeta' ).doc( currentUser.uid ).set( {
		recommendations: FieldValue.arrayRemove( uidToIgnore ),
		neverRecommend: FieldValue.arrayUnion( uidToIgnore )
	}, { merge: true } )

}

export const ignoreRequest = async ( app, uidToIgnore ) => {

	// Get current user
	const { auth: { currentUser }, db, FieldValue } = app

	// Update relationship to ignore user
	await db.collection( 'relationships' )
		.where( 'author', '==', currentUser.uid )
		.where( 'follower', '==', uidToIgnore )
		.get()
		.then( snap => {
			log( `Found ${ snap.docs.length } relationships to mark as ignored for author ${ currentUser.uid } and follower ${ uidToIgnore }` )
			return snap.docs.map( doc => doc.ref.set( { ignored: true, updated: Date.now() }, { merge: true } ) )
		} )


}

export const acceptFollower = async ( app, uidToIgnore ) => {

	// Get current user
	const { auth: { currentUser }, db, FieldValue } = app

	// Remove from my unconfirmed and add to never recommend
	await db.collection( 'userMeta' ).doc( currentUser.uid ).set( {
		unconfirmedFollowers: FieldValue.arrayRemove( uidToIgnore ),
		neverRecommend: FieldValue.arrayUnion( uidToIgnore )
	}, { merge: true } )

	// Update relationship to accept user
	await db.collection( 'relationships' )
		.where( 'author', '==', currentUser.uid )
		.where( 'follower', '==', uidToIgnore )
		.get()
		.then( snap => snap.docs.map( doc => doc.ref.set( {
			ignored: false,
			confirmed: true,
			updated: Date.now()
		}, { merge: true } ) ) )


}