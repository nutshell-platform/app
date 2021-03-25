const { Expo } = require( 'expo-server-sdk' )
const expo = new Expo()
const { log, error, dataFromSnap, timestampToHuman } = require( './helpers' )
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
const sendChunksReceiveTickets = chunks => Promise.all( chunks.map( chunk => expo.sendPushNotificationsAsync( chunk ) ) ).then( tChunks => flatten( tChunks ) )

// Turn tickets in to receipts
const ticketsToReceipts = tickets => {
	// Tickets are a numbered object so we need to arrayify it
	const ticketsArray = []
	Object.keys( tickets ).map( index => {
		ticketsArray.push( { ...tickets[index], index: index } )
	} )
	tickets = ticketsArray

	const receiptsIds = tickets.filter( ticket => ticket.id ).map( ticket => ticket.id )
	const receiptChunks = expo.chunkPushNotificationReceiptIds( receiptsIds )
	return Promise.all( receiptChunks.map( chunk => expo.getPushNotificationReceiptsAsync( chunk ) ) ).then( rChunks => flatten( rChunks ) )
}

// Format receipt/ticket errors to have less nesting
// Helper returns token object for destructuring
const tokenRegex = /ExponentPushToken\[.*\]/
const tokenFromMessage = message => {
	const token = typeof message == 'string' && message.match( tokenRegex )
	return token ? { token: token[0] } : { token: 'unknown' }
}
const resToError = ( { id, status, message, details } ) => ( { id: id, status: status, message: message, error: details.error, date: timestampToHuman(), timestamp: Date.now(), ...tokenFromMessage( message ) } )

// ///////////////////////////////
// Push notification sending
// ///////////////////////////////
exports.sendPushNotifications = async ( tokens, message={ title: undefined, body: undefined } ) => {

	if( !tokens || tokens.length == 0 ) return null

	const logs = [ 'start sendPushNotifications', message ]

	try {

		// Format messages and make chunks
		const messages = createMessages( tokens, message )
		logs.push( `Created ${ messages.length } messages` )

		const mChunks = toChunks( messages )
		logs.push( `Created ${ mChunks.length } chunks` )
		// Sent notifications

		const tickets = await sendChunksReceiveTickets( mChunks )
		logs.push( `Received ${ tickets.length } tockets` )

		// Format tickets and register them
		const formatTicket = ticket => ( {
				type: 'ticket',
				...( ticket.details ? resToError( ticket ) : ticket )
		} )

		await Promise.all( tickets.map( ticket => db.collection( 'pushLogs' ).doc( ticket.id ).set( formatTicket( ticket ) ) ) )
		logs.push( 'Pushed tickets to log' )

	} catch( e ) {
		error( 'Push notification error: ', e, logs )
		throw e
	}

}

// ////////////////////////////////////
// Retreiving push receipts from expo
// ////////////////////////////////////
exports.retreivePushReceipts = async f => {

	const logs = []


	try {

		// Get tickets from db
		const tickets = await db.collection( 'pushLogs' ).where( 'type', '==', 'ticket' ).where( 'status', '==', 'ok' ).get().then( dataFromSnap )
		logs.push( 'First ticket: ', tickets && tickets.length && tickets[0] )
		if( tickets.length == 0 ) return null
		// Get receipts from expo
		const receipts = await ticketsToReceipts( tickets )
		logs.push( 'receipts: ', receipts )
		if( receipts.length == 0 ) return null
		// Format receipts as array
		const receiptIdsRetreived = Object.keys( receipts )[0]
		const formattedReceipts = receipts.filter( receipt => Object.keys( receipt )[0] ).map( receipt => {
			const id = Object.keys( receipt )[0]
			return { id: id, ...receipt[ id ] }
		} )
		logs.push( 'Formatted receipts: ', formattedReceipts )
		// Parse receipt results
		await Promise.all( formattedReceipts.map( async receipt => {

			logs.push( 'Receipt: ', receipt )

			// If receipt indicated an error, overwrite the ticket entry with the receipt entry
			if( receipt.status != 'ok' ) return db.collection( 'pushLogs' ).doc( receipt.id ).set( resToError( receipt ) )

			// Is the receipt signals things are ok, delete the local ticket reference
			if( receipt.status == 'ok' ) return db.collection( 'pushLogs' ).doc( receipt.id ).delete()

			logs.push( 'THIS SHOULD NEVER HAPPEN' )

		} ) )

		logs.push( 'Receipts handled' )

	} catch( e ) {
		error( 'Push receipt error: ', e )
		logs.push( 'Push receipt error: ', e )
	} finally {
		log( 'Push receipt logs: ', logs )
	}

}