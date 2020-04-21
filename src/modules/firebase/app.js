// import * as firebase from 'firebase'
import  firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'
import 'firebase/storage'
import 'firebase/functions'

// Redux
import { store } from '../../redux/store'
const { dispatch } = store

// Actions
import { setUserAction } from '../../redux/actions/userActions'
import { setSettingsAction } from '../../redux/actions/settingsActions'
import { setNutshellDraft } from '../../redux/actions/nutshellActions'

// Config
import config from './config'

// Functions
import { listenForUserAndStartListeners, unregisterListeners, registerListeners } from './listeners'
import { listenUserLogin, listenUserChanges, registerUser, loginUser, updateUser, resetPassword, logoutUser, deleteUser } from './_user'
import { updateSettings, listenSettings } from './_settings'
import { createNutshell, updateNutshell, listenToLatestNutshell } from './_nutshells'
import { getRandomPeople } from './_friends'

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

	// ///////////////////////////////
	// User actions
	// ///////////////////////////////
	registerUser  = ( name, email, pass ) => registerUser( this, name, email, pass )
	loginUser     = ( email, pass ) => loginUser( this.auth, email, pass )
	updateUser	  = userUpdates => updateUser( this, userUpdates )
	logout		  = f => logoutUser( this.auth )
	deleteUser	  = f => deleteUser( this.auth )
	resetPassword = email => resetPassword( this.auth, email )

	// ///////////////////////////////
	// Settings
	// ///////////////////////////////
	updateSettings = settings => updateSettings( this, settings )

	// ///////////////////////////////
	// nutshells
	// ///////////////////////////////
	createNutshell = nutshell => createNutshell( this, nutshell )
	updateNutshell = nutshell => updateNutshell( this, nutshell )

	// ///////////////////////////////
	// friends
	// ///////////////////////////////
	getRandomPeople = f => getRandomPeople( this )

	// ///////////////////////////////
	// Initialisation
	// ///////////////////////////////

	// Register user listener in a promise wrapper that resolved when initial auth state is received
	init = f => new Promise( resolve => {

		this.listeners.auth = listenUserLogin( this, dispatch, setUserAction, resolve, [
			{ name: 'profile', listener: listenUserChanges, action: setUserAction },
			{ name: 'settings', listener: listenSettings, action: setSettingsAction },
			{ name: 'lastnutshell', listener: listenToLatestNutshell, action: setNutshellDraft }
		] )

	} )

	
	

}

export default new Firebase()