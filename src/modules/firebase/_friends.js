import { dataFromSnap, hash } from './helpers'

export const getRandomPeople = app => app.db.collection( 'users' ).get( ).then( dataFromSnap ).then( friends => friends.filter( friend => friend.uid != app.auth.currentUser.uid ) )

export const followPerson = ( app, theirUid ) => {
	const { currentUser: { uid: myUid } } = app.auth
	return app.db.collection( 'relationships' ).add( {
		follower: myUid,
		author: theirUid
	} )
}

export const unfollowPerson = ( app, theirUid ) => {
	const { currentUser: { uid: myUid } } = app.auth
	return app.db.collection( 'relationships' )
	.where( 'follower', '==', myUid )
	.where( 'author', '==', theirUid )
	.get()
	.then( snap => snap.docs.map( doc => doc.ref.delete() ) )
}
export const findPerson = async ( app, query ) => {

	const { currentUser: { uid: myUid } } = app.auth
	const isEmail = query.match( /[\w-]+?@{1}[\w-]+?[\w\.]+/ )
	const readProfile = ( { uid } ) => app.db.collection( 'users' ).doc( uid ).get().then( dataFromSnap )
	const notMe = users => users.filter( ( { uid } ) => uid != myUid )

	// Sanetise
	query = query[0] == '@' ? query.substring( 1 ).trim() : query.trim()

	try {

		if( isEmail ) {
			const matches = await app.db.collection( 'fingerprints' ).where( 'email', '==', hash( query ) ).get().then( dataFromSnap )
			return Promise.all( notMe( matches ).map( readProfile ) )
		} else {
			return app.db.collection( 'users' ).where( 'handle', '==', query.toLowerCase() ).get().then( dataFromSnap ).then( notMe )
		}

	} catch( e ) {
		throw e
	}

}

export const getPerson = async ( db, query, by ) => {

	try {
		let user
		if( by == 'uid' ) user = await db.collection( 'users' ).doc( query ).get().then( dataFromSnap )
		else user = await db.collection( 'users' ).where( by, '==', query ).get().then( dataFromSnap ).then( hits => hits[0] || {} )
		if( !user.uid ) throw 'User not found'
		const meta = await db.collection( 'userMeta' ).doc( user.uid ).get().then( dataFromSnap )
		return { ...user, ...meta }
	} catch( e ) {
		throw e
	}

}