// Data helpers
const { dataFromSnap, log, error, dateOfNext, distanceToNextDayType } = require( './helpers' )
const { db, FieldValue } = require( './firebase' )
const { sendPushNotifications } = require( './push' )

exports.unreadNutshells = async f => {

	try {

		// Load users with a known friday timezone
		const usersWhoWantToBeNotified = await db.collection( 'settings' )
			.where( 'notifications.readReminder', '==', true )
			.where( 'times.mondayNoon', '<', Date.now() )
			.get().then( dataFromSnap )

		// If no data, exit
		if( !usersWhoWantToBeNotified || usersWhoWantToBeNotified.length == 0 ) return null

		// Load inboxes of those users, but only keep the data is they have a full inbox
		const inboxesOfThoseUsers = await Promise.all( usersWhoWantToBeNotified.map( async user => {

			// Read inbox
			const inbox = await db.collection( 'inbox' ).doc( user.uid ).get().then( dataFromSnap )

			// If inbox has items, return length only
			if( inbox && inbox.nutshells && inbox.nutshells.length != 0 ) {

				// Grab push tokens of the user that has a full inbox
				const { pushTokens } = usersWhoWantToBeNotified.find( user => user.uid == inbox.uid )

				// If we have push tokens, return data, otherwise return false
				if( pushTokens && pushTokens.length != 0 ) return { uid: inbox.uid, nutshells: inbox.nutshells.length, pushTokens: pushTokens, times: user.times }
				else return false
			}

			// If not return no objext
			else return false

		} ) )

		if( !inboxesOfThoseUsers || inboxesOfThoseUsers.length == 0 ) {
			log( 'No inboxes of users that want to be notified' )
			return null
		}

		// Filter out the inboxes that have no content
		const fullInboxesWithPushTokens = inboxesOfThoseUsers.filter( inbox => inbox.nutshells )
		log( 'Full inboxes: ', fullInboxesWithPushTokens )

		// Notify those will full inboxes
		const unreadMessage = amount => ( {
			title: `${amount} unread nutshells!`,
			body: `Read what your friends have to say this week.`,
			data: {
				goto: '/nutshells/read'
			}
		} )

		// Date resets
		const extraWeek = ( 1000 * 60 * 60 * 24 * 7 )
		const nextMonday = distanceToNextDayType( 'monday' ) == 0 ? ( dateOfNext( 'monday' ).setHours( 10, 0, 0, 0 ) + extraWeek ) : dateOfNext( 'monday' ).setHours( 10, 0, 0, 0 )

		// Send all notifications in parrallell
		await Promise.all( fullInboxesWithPushTokens.map( async ( { uid, times, pushTokens, nutshells } ) => {

			try {

				// Send the notification
				await sendPushNotifications( pushTokens, unreadMessage( nutshells ) )

				// If notification was sent, set the next notification moment to a week later
				return db.collection( 'settings' ).doc( uid ).set( { times: {
					// Set to one week from now
					mondayNoon: times.mondayNoon + ( 1000 * 60 * 60 * 24 * 7 )
				} }, { merge: true } )

			} catch( e ) {
				throw e
			}

		} ) )

		log( 'All done for inboxes: ', fullInboxesWithPushTokens.length )


	} catch( e ) {
		error( 'Unread Nutshell error: ', e )
	}

}

exports.rememberToWrite = async f => {

	try {

		// Load users with a known friday timezone
		const usersWhoWantToBeNotifiedFriday = await db.collection( 'settings' )
			.where( 'notifications.writeReminder', '==', true )
			.where( 'times.fridayNoon', '<', Date.now() )
			.get().then( dataFromSnap )

		// Load users with a known sunday timezone
		const usersWhoWantToBeNotifiedSunday = await db.collection( 'settings' )
			.where( 'notifications.writeReminder', '==', true )
			.where( 'times.sundayNoon', '<', Date.now() )
			.get().then( dataFromSnap )


		let usersWhoWantToBeNotified = [ ...usersWhoWantToBeNotifiedFriday, ...usersWhoWantToBeNotifiedSunday ]

		log( 'All user notification entries: ', usersWhoWantToBeNotified.length )

		// Take out duplicates which will exist because we do a double .get()
		const alreadyInList = []
		usersWhoWantToBeNotified = usersWhoWantToBeNotified.filter( ( { uid } ) => {

			// Filter out those that have already been scanned
			if( alreadyInList.includes( uid ) ) return false

			// Keep if not and put it in the list
			alreadyInList.push( uid )
			return true

		} )

		log( 'Users to notify (deduped): ', usersWhoWantToBeNotified.length )

		if( !usersWhoWantToBeNotified || usersWhoWantToBeNotified.length == 0 ) return null

		// Date resets
		const extraWeek = ( 1000 * 60 * 60 * 24 * 7 )
		const nextFriday = distanceToNextDayType( 'friday' ) == 0 ? ( dateOfNext( 'friday' ).setHours( 10, 0, 0, 0 ) + extraWeek ) : dateOfNext( 'friday' ).setHours( 10, 0, 0, 0 )
		const nextSunday = distanceToNextDayType( 'sunday' ) == 0 ? ( dateOfNext( 'sunday' ).setHours( 10, 0, 0, 0 ) + extraWeek ) : dateOfNext( 'sunday' ).setHours( 10, 0, 0, 0 )

		// Notify those will full inboxes
		const unreadMessage = { title: `Remember to write your Nutshell!`, body: `The deadline is midnight this Sunday.` }
		await Promise.all( usersWhoWantToBeNotified.map( async ( { uid, times, pushTokens } ) => {

			try {

				// Send the notification
				await sendPushNotifications( pushTokens, unreadMessage )

				// If notification was sent, set the next notification moment to a week later
				return db.collection( 'settings' ).doc( uid ).set( { times: {
					// Set to one week from now
					fridayNoon: nextFriday,
					sundayNoon: nextSunday

				} }, { merge: true } ).catch( console.log.bind( console ) )


			} catch( e ) {
				error( e )
				throw e
			}

		} ) )

	} catch( e ) {
		error( 'Remember to write error: ', e )
	}

}

exports.resetNotificationTimes = async f => {

	try {

		// Load users with a known friday timezone
		const allUsers = await db.collection( 'settings' ).get().then( dataFromSnap )

		const usersWhoWantToBeNotified = allUsers

		log( 'Users to notify: ', usersWhoWantToBeNotified )

		if( !usersWhoWantToBeNotified || usersWhoWantToBeNotified.length == 0 ) return null

		log( 'Generate times', dateOfNext( 'friday' ) )
		// Date resets
		const nextFriday = dateOfNext( 'friday' ).setHours( 10, 0, 0, 0 )
		const nextSunday = dateOfNext( 'sunday' ).setHours( 10, 0, 0, 0 )
		const nextMonday = dateOfNext( 'monday' ).setHours( 10, 0, 0, 0 )

		log( `${ nextMonday }, ${nextFriday}, ${ nextSunday }` )


		// Notify those will full inboxes
		const unreadMessage = {
			title: `Remember to write your Nutshell!`,
			body: `The deadline is midnight this Sunday.`,
			data: {
				goto: '/nutshells/write'
			}
		}
		await Promise.all( usersWhoWantToBeNotified.map( async ( { uid } ) => {

			try {

				log( 'Notifying: ', uid )

				// If notification was sent, set the next notification moment to a week later
				return db.collection( 'settings' ).doc( uid ).set( { times: {
					// Set to one week from now
					fridayNoon: nextFriday,
					sundayNoon: nextSunday,
					mondayNoon: nextMonday

				} }, { merge: true } )


			} catch( e ) {
				error( e )
				throw e
			}

		} ) )

	} catch( e ) {
		error( 'Remember to write error: ', e )
	}

}
