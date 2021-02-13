// import { dataFromSnap } from './helpers'
import { log, catcher, getuid } from '../helpers'

export const saveAudioEntry = async ( app, uidOfNutshell, audioBlob ) => {

	try {

		const { storage, auth } = app

		// User-settings
		const { uid } = auth.currentUser
		const path = `audioNutshells/${uid}/${ uidOfNutshell }`

		// Upload new file	
		const { ref } = await storage.child( path ).put( audioBlob )
		const url = await ref.getDownloadURL()
		
		// Add newly updated file to firebase
		await app.db.collection( 'nutshells' ).doc( uidOfNutshell || await getuid() ).set( {
			audio: [ url ],
			updated: Date.now(),
		}, { merge: true } )

	} catch( e ) {
		catcher( `Error uploading audio nutshell for ${ uidOfNutshell }: ${ e.message }` )
	}

}