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
const { publish, deleteFromInboxesOnNutshellDelete, makeDemo, scheduledNutshells } = require( './modules/nutshells' )
// cron: Every hour monday and tuesday 0 * * * 1,2
exports.publish = functions.runWith( { timeoutSeconds: 540, memory: '2GB' } ).pubsub.schedule( '0 * * * 1,2' ).onRun( publish )
exports.deleteFromInboxesOnNutshellDelete = functions.firestore.document( 'nutshells/{nutshellUid}' ).onDelete( deleteFromInboxesOnNutshellDelete )
exports.scheduledNutshells = functions.https.onRequest( async ( req, res ) => {
	if( req.query.secret != 42 ) return res.send( 'Invalid authentication' )
	try {
		const nutshells = await scheduledNutshells( !!req.query.all )
		return res.send( nutshells )
	} catch( e ) {
		return res.send( { error: e } )
	}
} )

// exports.makeDemo = functions.pubsub.schedule( '0 12,0 * * *' ).onRun( makeDemo )


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
const { unreadNutshells, rememberToWrite, resetNotificationTimes } = require( './modules/notifications' )

// Triggers every monday noon based on firestore time declarations
// Cron: every 5 past on mondays
exports.notifyOfUnreadNutshells = functions.pubsub.schedule( '5 * * * 1,2' ).onRun( unreadNutshells )

// Triggers every friday and sunday noon based on firestore declarations
// Cron 5 * * * 5,0 means every hour at 5 past on fri and sun. See https://crontab.guru/#5_*_*_*_5,0
exports.notifyRememberToWrite = functions.pubsub.schedule( '5 * * * 5,0' ).onRun( rememberToWrite )

// exports.resetNotificationTimes = functions.https.onCall( resetNotificationTimes )

// Debugging
// exports.manualPushReceiptHandler = functions.https.onCall( ( context, data ) => retreivePushReceipts( db ) )
// const tokens = [ 'ExponentPushToken[4KmlslOnJCvvNS3-jHOS5k]' ]
// const message = { body: 'Derp' }
// exports.manualPushSend = functions.https.onCall( ( context, data ) => sendPushNotifications( db, tokens, message ) )
// exports.manualInboxNotifier = functions.https.onCall( rememberToWrite )