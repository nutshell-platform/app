import { dataFromSnap } from './helpers'

export const getModerationQueue = app => app.db.collection( 'reportedAbuse' ).where( 'moderated', '==', false ).get().then( dataFromSnap )

export const markAbuseModerated = ( app, reportUid ) => app.db.collection( 'reportedAbuse' ).doc( reportUid ).set( { moderated: true }, { merge: true } )

export const sendMassMessage = ( app, message ) => app.func.httpsCallable( 'sendMassMessage' )( message )

export const getScheduledNutshells = app => app.func.httpsCallable( 'getScheduledNutshells' )()

export const updateAllAlgoliaAccountEntries = app => app.func.httpsCallable( 'updateAllAlgoliaAccountEntries' )()