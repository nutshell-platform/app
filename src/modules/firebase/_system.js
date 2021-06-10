import { dataFromSnap } from './helpers'

export const getModerationQueue = app => app.db.collection( 'reportedAbuse' ).where( 'moderated', '==', false ).get().then( dataFromSnap )

export const markAbuseModerated = ( app, reportUid ) => app.db.collection( 'reportedAbuse' ).doc( reportUid ).set( { moderated: true }, { merge: true } )

export const sendMassMessage = ( app, message ) => app.func.httpsCallable( 'sendMassMessage' )( message )

export const refreshAllReccsAndScores = app => app.func.httpsCallable( 'refreshAllReccsAndScores' )( ).then( f => alert( 'Success' ) ).catch( e => alert( `Fail ${ e.message }` ) )

export const getScheduledNutshells = app => app.func.httpsCallable( 'getScheduledNutshells' )()

export const updateAllAlgoliaAccountEntries = app => app.func.httpsCallable( 'updateAllAlgoliaAccountEntries' )()

export const deleteMyDemoData = app => {

	// Get funcs and data
	const { func } = app
	const doDeleteDemoDataFor = func.httpsCallable( 'deleteDemoDataFor' )

	// Generare recommendations
	return doDeleteDemoDataFor().then( f => alert( 'Demo data deletion success' ) ).catch( e => alert( `Fail ${ e.message }` ) )

}