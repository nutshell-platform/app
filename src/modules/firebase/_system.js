import { dataFromSnap } from './helpers'

export const getModerationQueue = app => app.db.collection( 'reportedAbuse' ).where( 'moderated', '==', false ).get().then( dataFromSnap )

export const markAbuseModerated = ( app, reportUid ) => app.db.collection( 'reportedAbuse' ).doc( reportUid ).set( { moderated: true }, { merge: true } )