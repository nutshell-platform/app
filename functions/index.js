const functions = require('firebase-functions')

// ///////////////////////////////
// On relation create
// ///////////////////////////////
const { follow, unfollow } = require( './modules/following' )
exports.unFollow = functions.firestore.document( 'relationships/{relationId}' ).onDelete( unfollow )
exports.follow = functions.firestore.document( 'relationships/{relationId}' ).onWrite( follow )

// ///////////////////////////////
// Cron
// ///////////////////////////////
const { publish } = require( './modules/nutshells' )
exports.publish = functions.runWith( { timeoutSeconds: 540, memory: '2GB' } ).pubsub.schedule( 'every 1 hours' ).onRun( publish )

// ///////////////////////////////
// Push notification handling
// ///////////////////////////////
const { retreivePushReceipts } = require( './modules/push' )

// Get receipts
exports.pushReceiptHandler = functions.pubsub.schedule( 'every 6 hours' ).onRun( retreivePushReceipts )

// ///////////////////////////////
// Notifications
// ///////////////////////////////
const { unreadNutshells } = require( './modules/notifications' )
exports.notifyOfUnreadNutshells = functions.pubsub.schedule( 'every monday 13:00' ).onRun( unreadNutshells )

// Debugging
// exports.manualPushReceiptHandler = functions.https.onCall( ( context, data ) => retreivePushReceipts( db ) )
// const tokens = [ 'ExponentPushToken[4KmlslOnJCvvNS3-jHOS5k]' ]
// const message = { body: 'Derp' }
// exports.manualPushSend = functions.https.onCall( ( context, data ) => sendPushNotifications( db, tokens, message ) )
exports.manualInboxNotifier = functions.https.onCall( unreadNutshells )