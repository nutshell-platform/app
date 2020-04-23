import { dataFromSnap } from './helpers'

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