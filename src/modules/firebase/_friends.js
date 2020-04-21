import { dataFromSnap } from './helpers'

export const getRandomPeople = app => app.db.collection( 'users' ).get( ).then( dataFromSnap ).then( friends => friends.filter( friend => friend.uid != app.auth.currentUser.uid ) )

export const another = true