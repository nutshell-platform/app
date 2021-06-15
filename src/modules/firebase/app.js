// import * as firebase from 'firebase'
import  firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'
import 'firebase/storage'
import 'firebase/functions'

// Helpers
import { dev, isWeb } from '../apis/platform'
import { log } from '../helpers'

// Analytics
import * as Analytics from 'expo-firebase-analytics'
// If dev, keep analytics in dev
if( !isWeb && dev ) Analytics.setDebugModeEnabled( true )

// Redux
import { store } from '../../redux/store'
const { dispatch } = store

// Actions
import { setUserAction, setUserMetaAction, setUserContactMethodsAction } from '../../redux/actions/userActions'
import { setSettingsAction } from '../../redux/actions/settingsActions'
import { setNutshellDraft, setNutshellInbox, setNutshellArchive } from '../../redux/actions/nutshellActions'

// Config
import config from './config'
import * as Network from 'expo-network'



// Functions
import { listenUserLogin, listenUserChanges, registerUser, loginUser, updateUser, resetPassword, logoutUser, deleteUser, handleIsAvailable, listenUserMetaChanges, updateContactMethods, listenContactMethods } from './_user'
import { updateSettings, listenSettings, setLocalTimeToSettings } from './_settings'
import { createNutshell, updateNutshell, listenToLatestNutshell, getNutshellsOfUser, listenToNutshellInbox, getNutshellByUid, markNutshellRead, reportNutshell, muteNutshell, deleteNutshell, createTestNutshell, listenToNutshellArchive, removeNutshellFromArchive, getNutshellsByUids } from './_nutshells'
import { saveAudioEntry, deleteAudioEntry } from './_audio_nutshells'
import { getRandomPeople, followPerson, unfollowPerson, findPerson, getPerson, blockPerson, unblockPerson, getContactRecommendations, unrecommendPerson, ignoreRecommendation, ignoreRequest, acceptFollower, addMultipleTestFollowers } from './_friends'
import { getModerationQueue, markAbuseModerated, sendMassMessage, getScheduledNutshells, updateAllAlgoliaAccountEntries, refreshAllReccsAndScores, deleteMyDemoData } from './_system'
import { getAndSaveFingerprints } from './_fingerprints'

// ///////////////////////////////
// Firebase manager class
// ///////////////////////////////
class Firebase {

	// ///////////////////////////////
	// Set up firebase
	// ///////////////////////////////
	fb 			= firebase.initializeApp( config )
	db 			= this.fb.firestore()
	storage 	= this.fb.storage().ref()
	func 		= this.fb.functions()
	auth 		= this.fb.auth()
	listeners 	= {}
	FieldValue  = firebase.firestore.FieldValue
	Auth 		= firebase.auth
	analytics  	= Analytics

	// ///////////////////////////////
	// User actions
	// ///////////////////////////////
	registerUser  = ( name, handle, email, pass ) => registerUser( this, name, handle, email, pass )
	loginUser     = ( email, pass ) => loginUser( this.auth, email, pass )
	updateUser	  = userUpdates => updateUser( this, userUpdates )
	logout		  = f => logoutUser( this, dispatch )
	deleteUser	  = password => deleteUser( this, password )
	resetPassword = email => resetPassword( this.auth, email )

	// Helpers
	isOnline = f => Network.getNetworkStateAsync().then( ( { isInternetReachable } ) => isInternetReachable ).catch( f => false )

	// ///////////////////////////////
	// Settings
	// ///////////////////////////////
	updateSettings = settings => updateSettings( this, settings )
	handleIsAvailable = handle => handleIsAvailable( this.db, handle )
	updateContactMethods = methods => updateContactMethods( this, methods )

	// ///////////////////////////////
	// nutshells
	// ///////////////////////////////
	createNutshell     = nutshell => createNutshell( this, nutshell )
	updateNutshell     = nutshell => updateNutshell( this, nutshell )
	deleteNutshell 	   = uid 	  => deleteNutshell( this, uid )
	createTestNutshell = f 		  => createTestNutshell( this )
	getNutshellsOfUser = uid 	  => getNutshellsOfUser( this, uid )
	getNutshellByUid   = uid 	  => getNutshellByUid( this.db, uid, dispatch )
	getNutshellsByUids   = uids 	  => getNutshellsByUids( this.db, uids, dispatch )
	markNutshellRead   = uid 	  => markNutshellRead( this, uid )
	removeNutshellFromArchive   = uid 	  => removeNutshellFromArchive( this, uid )
	reportNutshell	   = report   => reportNutshell( this, report )
	muteNutshell	   = uid 	  => muteNutshell( this, uid )


	// Audio
	saveAudioEntry = ( uidOfNutshell, status, audioBlob, extension ) => saveAudioEntry( this, uidOfNutshell, status, audioBlob, extension )
	deleteAudioEntry = ( uidOfNutshell, extension ) => deleteAudioEntry( this, uidOfNutshell, extension )

	// ///////////////////////////////
	// System functions
	// ///////////////////////////////
	getModerationQueue  = f => getModerationQueue( this )
	markAbuseModerated  = reportUid => markAbuseModerated( this, reportUid )
	sendMassMessage = message => sendMassMessage( this, message )
	refreshAllReccsAndScores = f => refreshAllReccsAndScores( this )
	getScheduledNutshells = f => getScheduledNutshells( this )
	updateAllAlgoliaAccountEntries = f => updateAllAlgoliaAccountEntries( this )
	deleteMyDemoData = f => deleteMyDemoData( this )

	// ///////////////////////////////
	// friends
	// ///////////////////////////////
	getRandomPeople = f => getRandomPeople( this )
	followPerson 	= theirUid => followPerson( this, theirUid )
	unfollowPerson 	= theirUid => unfollowPerson( this, theirUid )
	findPerson      = query => findPerson( this, query )
	getPerson 		= ( query, by='handle' ) => getPerson( this.db, query, by )
	blockPerson 	= uid => blockPerson( this, uid )
	unblockPerson 	= uid => unblockPerson( this, uid )
	ignoreRecommendation = uid => ignoreRecommendation( this, uid )
	ignoreRequest = uid => ignoreRequest( this, uid )
	acceptFollower = uid => acceptFollower( this, uid )
	addMultipleTestFollowers = f => addMultipleTestFollowers( this )

	// ///////////////////////////////
	// Fingerprints & recommendations
	// ///////////////////////////////
	getAndSaveFingerprints = f => getAndSaveFingerprints( this )
	getContactRecommendations = f => getContactRecommendations( this )
	unrecommendPerson = uid => unrecommendPerson( this, uid )

	// ///////////////////////////////
	// Analytics
	// ///////////////////////////////
	analyticsSetScreen = path => this.analytics && this.analytics.setCurrentScreen( path ).catch( f => f )

	// ///////////////////////////////
	// Initialisation
	// ///////////////////////////////

	// Register user listener in a promise wrapper that resolved when initial auth state is received
	init = async history => {

		try {

			// Keep a reference to the history object
			if( history ) this.history = history

			// Enable expetimental firestore setting
			// https://firebase.google.com/docs/reference/js/firebase.firestore.Settings#experimentalforcelongpolling
			this.db.settings( { experimentalForceLongPolling: true } )

			this.listeners.auth = await listenUserLogin( this, dispatch, setUserAction, [
				{ name: 'profile', listener: listenUserChanges, action: setUserAction },
				{ name: 'meta', listener: listenUserMetaChanges, action: setUserMetaAction },
				{ name: 'settings', listener: listenSettings, action: setSettingsAction },
				{ name: 'lastnutshell', listener: listenToLatestNutshell, action: setNutshellDraft },
				{ name: 'nutshellinbox', listener: listenToNutshellInbox, action: setNutshellInbox },
				{ name: 'nutshellarchive', listener: listenToNutshellArchive, action: setNutshellArchive },
				{ name: 'contactmethods', listener: listenContactMethods, action: setUserContactMethodsAction }
			] )

			log( 'Listeners created: ', this.listeners )

			setLocalTimeToSettings( this )

		} catch( e ) {
			log( 'Firebase init error: ', e )
		}

	}

	
	

}

export default new Firebase()