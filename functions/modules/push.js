const { Expo } = require( 'expo-server-sdk' )
const expo = new Expo()
const { log, dataFromSnap } = require( './helpers' )
const { flatten } = require( 'array-flatten' )
const { db } = require( './firebase' )


// Parse tokens into message objects
// Message syntax: https://docs.expo.io/versions/latest/guides/push-notifications
const createMessages = ( tokens, message ) => tokens.filter( token => Expo.isExpoPushToken( token ) ).map( token => ( { to: token, ...message } ) )

// Convert messages to chunks
const toChunks = messages => expo.chunkPushNotifications( messages )

// Send messages to expo
// Good: { "data": [ { "status": "ok", "id": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX" } ] }
// Error: { "data": [ { "status": "error", "message": "\"ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]\" is not a registered push notification recipient", "details": { "error": "DeviceNotRegistered" } } ] }
const sendChunksReceiveTickets = async chunks => Promise.all( chunks.map( chunk => expo.sendPushNotificationsAsync( chunk ) ) ).then( tChunks => flatten( tChunks ) )

// Turn tickets in to receipts
const ticketsToReceipts = tickets => {
	const receiptsIds = tickets.filter( ticket => ticket.id ).map( ticket => ticket.id )
	const receiptChunks = expo.chunkPushNotificationReceiptIds( receiptsIds )
	return Promise.all( receiptChunks.map( chunk => expo.getPushNotificationReceiptsAsync( chunk ) ) ).then( rChunks => flatten( rChunks ) )
}

// Format receipt/ticket errors to have less nesting
// Helper returns token object for destructuring
const tokenRegex = /ExponentPushToken\[.*\]/
const tokenFromMessage = message => {
	const token = message.match( tokenRegex )
	return token ? { token: token[0] } : {}
}
const resToError = ( { id, status, message, details } ) => ( { id: id, status: status, message: message, error: details.error, ...tokenFromMessage( tokenRegex ) } )

// ///////////////////////////////
// Push notification sending
// ///////////////////////////////
exports.sendPushNotifications = async ( tokens, message={ title: undefined, body: undefined } ) => {

	try {

		// Format messages and make chunks
		const messages = createMessages( tokens, message )

		const mChunks = toChunks( messages )

		// Sent notifications
		const tickets = await sendChunksReceiveTickets( mChunks )

		// Format tickets and register them
		const formatTicket = ticket => ( {
				type: 'ticket',
				...( ticket.details ? resToError( ticket ) : ticket )
		} )
		await Promise.all( tickets.map( ticket => db.collection( 'pushLogs' ).doc( ticket.id ).set( formatTicket( ticket ) ) ) )

	} catch( e ) {
		log( 'Push notification error: ', e )
	}

}

// ////////////////////////////////////
// Retreiving push receipts from expo
// ////////////////////////////////////
exports.retreivePushReceipts = async f => {


	try {

		// Get tickets from db
		const tickets = await db.collection( 'pushLogs' ).where( 'type', '==', 'ticket' ).where( 'status', '==', 'ok' ).get().then( dataFromSnap )
		log( 'Tickets: ', tickets )
		if( tickets.length == 0 ) return null
		// Get receipts from expo
		const receipts = await ticketsToReceipts( tickets )
		log( 'receipts: ', receipts )
		if( receipts.length == 0 ) return null
		// Format receipts as array
		const receiptIdsRetreived = Object.keys( receipts )[0]
		const formattedReceipts = receipts.map( receipt => {
			const id = Object.keys( receipt )[0]
			return { id: id, ...receipt[ id ] }
		} )
		log( 'Formatted receipts: ', formattedReceipts )
		// Parse receipt results
		await Promise.all( formattedReceipts.map( async receipt => {

			// If receipt indicated an error, overwrite the ticket entry with the receipt entry
			if( receipt.status != 'ok' ) return db.collection( 'pushLogs' ).doc( receipt.id ).set( resToError( receipt ) )

			// Is the receipt signals things are ok, delete the local ticket reference
			if( receipt.status == 'ok' ) return db.collection( 'pushLogs' ).doc( receipt.id ).delete()

			log( 'THIS SHOULD NEVER HAPPEN' )

		} ) )

		log( 'Receipts handled' )

	} catch( e ) {
		log( 'Push receipt error: ', e )
	}

}