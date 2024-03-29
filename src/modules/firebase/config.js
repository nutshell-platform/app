import { isWeb } from '../apis/platform'
import { log } from '../helpers'
// variables
import { FIREBASE_apiKey, FIREBASE_authDomain, FIREBASE_databaseURL, FIREBASE_projectId, FIREBASE_storageBucket, FIREBASE_messagingSenderId, FIREBASE_appId, FIREBASE_measurementId, } from '@env'

if( isWeb ) log( 'Firebase project: ', FIREBASE_projectId )

export default {
	apiKey: FIREBASE_apiKey,
	authDomain: FIREBASE_authDomain,
	databaseURL: FIREBASE_databaseURL,
	projectId: FIREBASE_projectId,
	storageBucket: FIREBASE_storageBucket,
	messagingSenderId: FIREBASE_messagingSenderId,
	appId: FIREBASE_appId,
	measurementId: FIREBASE_measurementId
}