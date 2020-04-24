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
			return app.db.collection( 'users' ).where( 'handle', '==', query ).get().then( dataFromSnap ).then( notMe )
		}

	} catch( e ) {
		throw e
	}

}