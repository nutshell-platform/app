import { Alert as NativeAlert, Platform } from 'react-native'

// ///////////////////////////////
// Constants
// ///////////////////////////////
export const dev = process.env.NODE_ENV == 'development'
export const isWeb = Platform.OS == 'web'
// ///////////////////////////////
// Visual
// ///////////////////////////////
export const Dialogue = ( title, message, options=[ { text: 'ok', onPress: f => Promise.resolve() } ] ) => new Promise( resolve => {

	// Option has text and onpress
	if( !isWeb ) NativeAlert.alert(
		title,
		message,
		options.map( option => ( { ...option, onPress: f => option.onPress && option.onPress().then( res => resolve( res ) ) } ) ),
		{ cancelable: true }
	 )

	if( isWeb ) {
		if( confirm( `${title}\n\n${message}` ) ) options[0].onPress().then( resolve )
		else resolve()
	}

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
export const getuid = async f => uuidv4( { random: await Random.getRandomBytesAsync( 16 ) } )

// ///////////////////////////////
// Dates
// ///////////////////////////////

// Baselines
const msInADay = 86400000
const today = new Date()

// profiling the 1st of jan
const oneJan = new Date( today.getFullYear(), 0, 1 )
const oneJanDayType = oneJan.getDay()

export const timestampToHuman = ms => new Date( ms ).toString().match( /([a-zA-Z]* )([a-zA-Z]* )(\d+)/ )[0]

// Weeks are defined by the number of 7 day increments that have elapsed
export const weekNumber = f => {

    const daysPassedSinceOneJan = Math.floor( ( today.getTime() - oneJan.getTime() ) / msInADay )

    // Compose week number
    const weekNumber = Math.ceil( ( daysPassedSinceOneJan + oneJanDayType ) / 7 )

    return weekNumber
}

// Mondays are defined by the next by 7 divisible number of days passed since 
export const distanceToMonday = f => {
	let dayIndex = today.getDay()

	// 0 is sunday, the rest is already distance until monday if you substract one ( since sunday is 0 )
	return dayIndex == 0 ? 1 : 7 - ( dayIndex - 1 )
}

export const nextMonday = f => {
	const startofToday = new Date( today )
	startofToday.setHours( 0 )
	startofToday.setMinutes( 0 )
	startofToday.setSeconds( 0 )
	
	const nextMonday = startofToday.setDate( startofToday.getDate() + distanceToMonday() )
	return new Date( nextMonday )
}