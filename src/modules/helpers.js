import { Alert as NativeAlert, LogBox } from 'react-native'
import { dev, isWeb, isCI } from './apis/platform'
import { Sentry } from './sentry/sentry'
import { v4 as uuidv4 } from 'uuid'
import * as Random from 'expo-random'
import * as Linking from 'expo-linking'

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

export const log = ( ...messages ) => {
	if( dev ) console.log( ...messages )
}

export const error = ( ...messages ) => {
	if( dev ) {
		console.log( ...messages )
		console.log( 'Stack trace:' )
		console.trace()
	}
}

export const catcher = ( ...errors ) => {
	error( ...errors )
	// throw to sentry
	if( Sentry?.captureException ) Sentry.captureException( errors )
	// if it can't be done gracefully, do it bloody
	else {
		log( 'Sentry not available gracefully' )
		throw errors
	}
}

export const ignoreErrors = arr => LogBox && LogBox.ignoreLogs( arr )

// ///////////////////////////////
// Generators
// ///////////////////////////////
export const getuid = async f => uuidv4( { random: await Random.getRandomBytesAsync( 16 ) } )

export const sendEmail = ( to, subject, body ) => Linking.openURL( `mailto:${to}?subject=${subject}&body=${body}` )

// ///////////////////////////////
// Data manipulation
// ///////////////////////////////
export const uniqueByProp = ( array, propToFilterBy ) => {

	const matches = []

	return array.filter( item => {

		const valueThatShouldBeUnique = item[ propToFilterBy ]

		// If already found, exclude
		if( matches.includes( valueThatShouldBeUnique ) ) return false

		// Otherwise register and keep it
		matches.push( valueThatShouldBeUnique )
		return true

	} )

}

export const uniqueStrings = array => {

	const matches = []

	return array.filter( item => {

		// If already found, exclude
		if( matches.includes( item ) ) return false

		// Otherwise register and keep it
		matches.push( item )
		return true

	} )

}


// ///////////////////////////////
// Dates
// ///////////////////////////////

// Baselines
const msInADay = 86400000
const today = new Date()

// profiling the 1st of jan
const oneJan = new Date( today.getFullYear(), 0, 1 )
const oneJanDayType = oneJan.getDay()

export const timestampToHuman = ( ms, view ) => {
	if( view == 'dmy' ) return ( new Date( ms ).toString().match( /([a-zA-Z]* )(\d+ )(\d+)/ ) || [] )[0]
	if( view == 'y' ) return new Date( ms ).getFullYear()
	return ( new Date( ms ).toString().match( /([a-zA-Z]* )([a-zA-Z]* )(\d+)/ ) || [] )[0]
}

// Give timestamp of now, except in CI
export const timestampToTime = ms => isCI ? '12:11' : new Date( ms || Date.now() ).toString().match( /\d{1,2}:\d{1,2}/ )[0]

// Weeks are defined by the number of 7 day increments that have elapsed
export const weekNumber = day => {

	let baseline
	if( day ) {
		day = new Date( day )
		baseline = new Date( day.getFullYear(), 0, 1 )
	}
	if( !day ) {
		day = today
		baseline = oneJan
	}

    const daysPassedSinceOneJan = Math.floor( ( day.getTime() - baseline.getTime() ) / msInADay )

    // Compose week number
    const weekNumber = Math.ceil( ( daysPassedSinceOneJan + oneJanDayType ) / 7 )

    return weekNumber
}

// Calculating the distance until the next day of a week
export const distanceToNextDayType = ( targetDay, baseline ) => {

	// Find the index of the target day, where sunday is 0 because javascript
	const week = [ 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday' ]
	const targetIndex = week.indexOf( targetDay )

	// If parameter is not a day, break
	if( targetIndex == -1 ) throw 'Faulty day name'

	// Get the index of today relative to the local device
	const dayIndex = baseline ? baseline.getDay() : today.getDay()

	const distance = targetIndex - dayIndex

	// If the distance is negative than the day is in the past and we want next week's day of that type
	if( distance < 0 ) return distance + 7

	// If the distance is positive, the day is in the future and we're good
	return distance

}

export const dateOfNext = day => {

	// Generate midnight today ( the first second of today, whic is technically midnight yesterday )
	const startofToday = new Date( today )
	startofToday.setHours( 0, 0, 0, 0 )
	
	// Next day of the type input into the function, also it's first second of that day
	const nextDayOfSuppliedType = new Date()
	// Set the next day of that typed based on day of the month
	nextDayOfSuppliedType.setDate( startofToday.getDate() + distanceToNextDayType( day ) )
	nextDayOfSuppliedType.setHours( 0, 0, 0, 0 )

	// console.log( nextDayOfSuppliedType )
	return new Date( nextDayOfSuppliedType )
}