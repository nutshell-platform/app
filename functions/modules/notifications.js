// Data helpers
const { dataFromSnap, log } = require( './helpers' )
const { db, FieldValue } = require( './firebase' )
const { sendPushNotifications } = require( './push' )

exports.unreadNutshells = async f => {

	try {

		// Load users that want to be notified
		const usersWhoWantToBeNotified = await db.collection( 'settings' ).where( 'notifications.readReminder', '==', true ).get().then( dataFromSnap )

		// Load inboxes of those users, but only keep the data is they have a full inbox
		const inboxesOfThoseUsers = await Promise.all( usersWhoWantToBeNotified.map( async user => {

			// Read inbox
			const inbox = await db.collection( 'inbox' ).doc( user.uid ).get().then( dataFromSnap )

			// If inbox has items, return length only
			if( inbox.nutshells && inbox.nutshells.length != 0 ) {

				// Grab push tokens of the user that has a full inbox
				const { pushTokens } = usersWhoWantToBeNotified.find( user => user.uid == inbox.uid )

				// If we have push tokens, return data, otherwise return false
				if( pushTokens && pushTokens.length != 0 ) return { uid: inbox.uid, nutshells: inbox.nutshells.length, pushTokens: pushTokens }
				else return false
			}

			// If not return no objext
			else return false

		} ) )

		// Filter out the inboxes that have no content
		const fullInboxesWithPushTokens = inboxesOfThoseUsers.filter( inbox => inbox.nutshells )
		log( 'Full inboxes: ', fullInboxesWithPushTokens )

		// Notify those will full inboxes
		const unreadMessage = amount => ( { title: `You have ${amount} unread nutshells`, body: `Click notification to read` } )
		await Promise.all( fullInboxesWithPushTokens.map( ( { pushTokens, nutshells } ) => sendPushNotifications( pushTokens, unreadMessage( nutshells ) ) ) )


	} catch( e ) {
		log( 'Unread nutshell error: ', e )
	}

}

exports.rememberToWrite = async f => {

	try {

		// Load users that want to be notified
		const usersWhoWantToBeNotified = await db.collection( 'settings' ).where( 'notifications.writeReminder', '==', true ).get().then( dataFromSnap )

		// Notify those will full inboxes
		const unreadMessage = { title: `Remember to write your nutshell!`, body: `The next publishing round is on monday.` }
		await Promise.all( usersWhoWantToBeNotified.map( ( { pushTokens } ) => sendPushNotifications( pushTokens, unreadMessage ) ) )

	} catch( e ) {
		log( 'Remember to write error: ', e )
	}

}