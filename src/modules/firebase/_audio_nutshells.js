// import { dataFromSnap } from './helpers'
import { log, catcher, getuid } from '../helpers'

export const saveAudioEntry = async ( app, uidOfNutshell, statusOfDraftNutshell, audioBlob, extension ) => {

	try {

		const { storage, auth } = app

		// User-settings
		const { uid } = auth.currentUser || {}
		uidOfNutshell = uidOfNutshell || await getuid()
		const path = `audioNutshells/${uid}/${ uidOfNutshell }.${extension}`

		// Upload new file	
		const { ref } = await storage.child( path ).put( audioBlob )
		const url = await ref.getDownloadURL()

		// Create payload
		const nutshellContent = {
			audio: [ url ],
			updated: Date.now(),
			status: statusOfDraftNutshell || 'scheduled',
			owner: uid // Set the owner if it has not yet been set
		}

		log( `Updating audio entry ${ uidOfNutshell }: `, nutshellContent )
		
		// Add newly updated file to firebase
		await app.db.collection( 'nutshells' ).doc( uidOfNutshell ).set( nutshellContent, { merge: true } )

	} catch( e ) {
		catcher( `Error uploading audio nutshell for ${ uidOfNutshell }: ${ e.message }` )
	}

}

export const deleteAudioEntry = async ( app, uidOfNutshell, extension='.mp4' ) => {

	try {

		const { storage, auth } = app

		// User-settings
		const { uid } = auth.currentUser || {}
		const path = `audioNutshells/${uid}/${ uidOfNutshell }.${ extension }`

		// Delete old file
		await storage.child( path ).delete().catch( e => log( 'Error deleting audio: ', e ) )


	} catch( e ) {
		catcher( `Error deleting audio nutshell for ${ uidOfNutshell }: ${ e.message }` )
	}

}