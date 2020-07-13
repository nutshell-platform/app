// import * as firebase from 'firebase'
import  firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'
import 'firebase/storage'
import 'firebase/functions'

// Analytics
import * as Analytics from 'expo-firebase-analytics'

// Redux
import { store } from '../../redux/store'
const { dispatch } = store

// Actions
import { setUserAction, setUserMetaAction } from '../../redux/actions/userActions'
import { setSettingsAction } from '../../redux/actions/settingsActions'
import { setNutshellDraft, setNutshellInbox } from '../../redux/actions/nutshellActions'

// Config
import config from './config'
import * as Network from 'expo-network'

// Helpers
import { dev, isWeb } from '../apis/platform'

// If dev, keep analytics in dev
if( !isWeb && dev ) Analytics.setDebugModeEnabled( true )

// Functions
import { unregisterListeners, registerListeners } from './listeners'
import { listenUserLogin, listenUserChanges, registerUser, loginUser, updateUser, resetPassword, logoutUser, deleteUser, handleIsAvailable, listenUserMetaChanges } from './_user'
import { updateSettings, listenSettings, setLocalTimeToSettings } from './_settings'
import { createNutshell, updateNutshell, listenToLatestNutshell, getNutshellsOfUser, listenToNutshellInbox, getNutshellByUid, markNutshellRead, reportNutshell, muteNutshell, deleteNutshell } from './_nutshells'
import { getRandomPeople, followPerson, unfollowPerson, findPerson, getPerson, blockPerson, unblockPerson, getContactRecommendations, unrecommendPerson } from './_friends'
import { getModerationQueue, markAbuseModerated  } from './_system'
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
	analytics  	= Analytics

	// ///////////////////////////////
	// User actions
	// ///////////////////////////////
	registerUser  = ( name, handle, email, pass ) => registerUser( this, name, handle, email, pass )
	loginUser     = ( email, pass ) => loginUser( this.auth, email, pass )
	updateUser	  = userUpdates => updateUser( this, userUpdates )
	logout		  = f => logoutUser( this )
	deleteUser	  = f => deleteUser( this.auth )
	resetPassword = email => resetPassword( this.auth, email )

	// Helpers
	isOnline = f => Network.getNetworkStateAsync().then( ( { isInternetReachable } ) => isInternetReachable ).catch( f => false )

	// ///////////////////////////////
	// Settings
	// ///////////////////////////////
	updateSettings = settings => updateSettings( this, settings )
	handleIsAvailable = handle => handleIsAvailable( this.db, handle )

	// ///////////////////////////////
	// nutshells
	// ///////////////////////////////
	createNutshell     = nutshell => createNutshell( this, nutshell )
	updateNutshell     = nutshell => updateNutshell( this, nutshell )
	deleteNutshell 	   = uid 	  => deleteNutshell( this, uid )
	getNutshellsOfUser = uid 	  => getNutshellsOfUser( this, uid )
	getNutshellByUid   = uid 	  => getNutshellByUid( this.db, uid )
	markNutshellRead   = uid 	  => markNutshellRead( this, uid )
	reportNutshell	   = report   => reportNutshell( this, report )
	muteNutshell	   = uid 	  => muteNutshell( this, uid )

	// ///////////////////////////////
	// System functions
	// ///////////////////////////////
	getModerationQueue  = f => getModerationQueue( this )
	markAbuseModerated  = reportUid => markAbuseModerated( this, reportUid )

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

	// ///////////////////////////////
	// Fingerprints & recommendations
	// ///////////////////////////////
	getAndSaveFingerprints = f => getAndSaveFingerprints( this )
	getContactRecommendations = f => getContactRecommendations( this )
	unrecommendPerson = uid => unrecommendPerson( this, uid )

	// ///////////////////////////////
	// Initialisation
	// ///////////////////////////////

	// Register user listener in a promise wrapper that resolved when initial auth state is received
	init = async history => {

		// Keep a reference to the history object
		if( history ) this.history = history

		// Analytics DOES NOT WORK WITH EXPO!
		// if( isWeb ) this.fb.analytics()

		this.listeners.auth = await listenUserLogin( this, dispatch, setUserAction, [
			{ name: 'profile', listener: listenUserChanges, action: setUserAction },
			{ name: 'meta', listener: listenUserMetaChanges, action: setUserMetaAction },
			{ name: 'settings', listener: listenSettings, action: setSettingsAction },
			{ name: 'lastnutshell', listener: listenToLatestNutshell, action: setNutshellDraft },
			{ name: 'nutshellinbox', listener: listenToNutshellInbox, action: setNutshellInbox }
		] )

		setLocalTimeToSettings( this )

	}

	
	

}

export default new Firebase()