// import * as firebase from 'firebase'
import  firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'
import 'firebase/storage'
import 'firebase/functions'

console.log( firebase.firestore.FieldValue )

// Redux
import { store } from '../../redux/store'
const { dispatch } = store

// Actions
import { setUserAction, setUserMetaAction } from '../../redux/actions/userActions'
import { setSettingsAction } from '../../redux/actions/settingsActions'
import { setNutshellDraft, setNutshellInbox } from '../../redux/actions/nutshellActions'

// Config
import config from './config'

// Functions
import { listenForUserAndStartListeners, unregisterListeners, registerListeners } from './listeners'
import { listenUserLogin, listenUserChanges, registerUser, loginUser, updateUser, resetPassword, logoutUser, deleteUser, handleIsAvailable, listenUserMetaChanges } from './_user'
import { updateSettings, listenSettings } from './_settings'
import { createNutshell, updateNutshell, listenToLatestNutshell, getNutshellsOfUser, listenToNutshellInbox, getNutshellByUid, markNutshellRead } from './_nutshells'
import { getRandomPeople, followPerson, unfollowPerson, findPerson, getPerson } from './_friends'

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

	// ///////////////////////////////
	// User actions
	// ///////////////////////////////
	registerUser  = ( name, handle, email, pass ) => registerUser( this, name, handle, email, pass )
	loginUser     = ( email, pass ) => loginUser( this.auth, email, pass )
	updateUser	  = userUpdates => updateUser( this, userUpdates )
	logout		  = f => logoutUser( this.auth )
	deleteUser	  = f => deleteUser( this.auth )
	resetPassword = email => resetPassword( this.auth, email )

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
	getNutshellsOfUser = uid 	  => getNutshellsOfUser( this, uid )
	getNutshellByUid   = uid 	  => getNutshellByUid( this.db, uid )
	markNutshellRead   = uid 	  => markNutshellRead( this, uid )

	// ///////////////////////////////
	// friends
	// ///////////////////////////////
	getRandomPeople = f => getRandomPeople( this )
	followPerson 	= theirUid => followPerson( this, theirUid )
	unfollowPerson 	= theirUid => unfollowPerson( this, theirUid )
	findPerson      = query => findPerson( this, query )
	getPerson 		= ( query, by='handle' ) => getPerson( this.db, query, by )
	
	// ///////////////////////////////
	// Initialisation
	// ///////////////////////////////

	// Register user listener in a promise wrapper that resolved when initial auth state is received
	init = f => new Promise( resolve => {

		this.listeners.auth = listenUserLogin( this, dispatch, setUserAction, resolve, [
			{ name: 'profile', listener: listenUserChanges, action: setUserAction },
			{ name: 'meta', listener: listenUserMetaChanges, action: setUserMetaAction },
			{ name: 'settings', listener: listenSettings, action: setSettingsAction },
			{ name: 'lastnutshell', listener: listenToLatestNutshell, action: setNutshellDraft },
			{ name: 'nutshellinbox', listener: listenToNutshellInbox, action: setNutshellInbox }
		] )

	} )

	
	

}

export default new Firebase()