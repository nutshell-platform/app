// ///////////////////////////////
// Visual
// ///////////////////////////////

import { Alert as NativeAlert } from 'react-native'

export const Dialogue = ( title, message, options=[ { text: 'ok', onPress: f => Promise.resolve() } ] ) => new Promise( resolve => {

	// Option has text and onpress
	NativeAlert.alert(
		title,
		message,
		options.map( option => ( { ...option, onPress: f => option.onPress && option.onPress().then( res => resolve( res ) ) } ) ),
		{ cancelable: true }
	 )

} )

export const wait = ( time, error=false ) => new Promise( ( res, rej ) => setTimeout( error ? rej : res, time ) )

export const capitalize = string => string ? string.charAt(0).toUpperCase() + string.slice(1) : undefined

// ///////////////////////////////
// Debugging
// ///////////////////////////////
export const log = msg => {
	if( process.env.NODE_ENV == 'development' ) console.log( msg )
}

export const error = msg => {
	if( process.env.NODE_ENV == 'development' ) {
		console.log( msg )
		console.trace()
	}
}

export const catcher = e => {
	log( e )
	// throw to sentry
	throw e
}

// ///////////////////////////////
// Generators
// ///////////////////////////////
import { v4 as uuidv4 } from 'uuid'
import * as Random from 'expo-random'
export const getuuid = async f => uuidv4( { random: await Random.getRandomBytesAsync( 16 ) } )