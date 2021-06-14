const functions = require('firebase-functions')

// ///////////////////////////////
// Relationship management
// ///////////////////////////////
const { follow, unfollow, makePrivate, addMultipleTestFollowers, userWasDeleted, userMetaChanged } = require( './modules/following' )
exports.unFollow = functions.firestore.document( 'relationships/{relationId}' ).onDelete( unfollow )
exports.follow = functions.firestore.document( 'relationships/{relationId}' ).onWrite( follow )
exports.makeAccountPrivate = functions.firestore.document( 'settings/{userUid}' ).onWrite( makePrivate )
exports.userWasDeleted = functions.firestore.document( 'users/{userUid}' ).onDelete( userWasDeleted )
exports.userMetaChanged = functions.firestore.document( 'users/{userUid}' ).onWrite( userMetaChanged )



// ///////////////////////////////
// Automated data management
// ///////////////////////////////
const { publish, deleteFromInboxesOnNutshellDelete, getScheduledNutshells, createTestNutshell, deleteDemoDataFor } = require( './modules/nutshells' )
// cron: Every hour monday and tuesday 0 * * * 1,2
exports.publish = functions.runWith( { timeoutSeconds: 540, memory: '2GB' } ).pubsub.schedule( '0 * * * 1,2' ).onRun( publish )
exports.deleteFromInboxesOnNutshellDelete = functions.firestore.document( 'nutshells/{nutshellUid}' ).onDelete( deleteFromInboxesOnNutshellDelete )
exports.getScheduledNutshells = functions.https.onCall( ( data, context ) => getScheduledNutshells( context.auth.uid ) )

// Demo data management
exports.addMultipleTestFollowers = functions.https.onCall( ( data, context ) => addMultipleTestFollowers( context.auth.uid ) )
exports.createTestNutshell = functions.https.onCall( ( data, context ) => createTestNutshell( context.auth.uid ) )
exports.deleteDemoDataFor = functions.https.onCall( ( data, context ) => deleteDemoDataFor( context.auth.uid ) )

// ///////////////////////////////
// Push notification handling
// ///////////////////////////////
const { retreivePushReceipts } = require( './modules/push' )

// Get receipts
// Cron: run twice daily 0 12,0 * * *
exports.pushReceiptHandler = functions.pubsub.schedule( '0 12,0 * * *' ).onRun( retreivePushReceipts )

// ///////////////////////////////
// Notifications
// ///////////////////////////////
const { unreadNutshells, rememberToWrite, resetNotificationTimes, sendMassMessage } = require( './modules/notifications' )

// Triggers every monday noon based on firestore time declarations
// Cron: every 5 past on mondays
exports.notifyOfUnreadNutshells = functions.pubsub.schedule( '5 * * * 1,2' ).onRun( unreadNutshells )

// Triggers every friday and sunday noon based on firestore declarations
// Cron 5 * * * 5,0 means every hour at 5 past on fri and sun. See https://crontab.guru/#5_*_*_*_5,0
exports.notifyRememberToWrite = functions.pubsub.schedule( '5 * * * 5,0' ).onRun( rememberToWrite )

// Mass marketing push messages
exports.sendMassMessage = functions.https.onCall( sendMassMessage )

// ///////////////////////////////
// Figerprints
// ///////////////////////////////
const { saveFingerprints } = require( './modules/fingerprints' )
exports.saveFingerprints = functions.runWith( { timeoutSeconds: 540, memory: '2GB' } ).https.onCall( saveFingerprints )

// ///////////////////////////////
// Recommendation engine
// ///////////////////////////////
const { scoreUser, getContactRecommendations, refreshAllReccsAndScores } = require( './modules/recommendations' )
exports.scoreUser = functions.https.onCall( ( data, context ) => scoreUser( context.auth.uid ) )
exports.getContactRecommendations = functions.https.onCall( ( data, context ) => getContactRecommendations( context.auth.uid ) )
exports.refreshAllReccsAndScores = functions.https.onCall( refreshAllReccsAndScores )

// ///////////////////////////////
// Algolia search support
// ///////////////////////////////
const { updateAlgoliaAccountOnWrite, updateAllAlgoliaAccountEntries, searchAlgoliaAccountEntries } = require( './modules/algolia' )
exports.updateAllAlgoliaAccountEntries = functions.https.onCall( ( data, context ) => updateAllAlgoliaAccountEntries( context.auth.uid ) )
exports.onAccountWritten = functions.firestore.document( 'users/{uid}' ).onWrite(  updateAlgoliaAccountOnWrite )
exports.searchAlgoliaAccountEntries = functions.https.onCall( searchAlgoliaAccountEntries )

// ///////////////////////////////
// Debugging
// ///////////////////////////////
// "HYmfM9Pkp4S88qJwxuJ1N5q4Igp1" <- mentor@palokaj.co
// exports.resetNotificationTimes = functions.https.onCall( resetNotificationTimes )
// const { makeDemo } = require( './modules/nutshells' )
// exports.makeDemo = functions.pubsub.schedule( '0 12,0 * * *' ).onRun( makeDemo )
// const { sendPushNotifications } = require( './modules/push' )
// exports.manualPushReceiptHandler = functions.https.onCall( ( context, data ) => retreivePushReceipts( db ) )
// const tokens = [ 'ExponentPushToken[4KmlslOnJCvvNS3-jHOS5k]' ]
// const message = { body: 'Derp' }
// exports.manualPushSend = functions.https.onCall( ( data, context) => sendPushNotifications( tokens, message ) )
// exports.manualInboxNotifier = functions.https.onCall( rememberToWrite )