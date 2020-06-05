import { Alert as NativeAlert, YellowBox } from 'react-native'
import { dev, isWeb } from './apis/platform'

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
	if( dev ) console.log( msg )
}

export const error = msg => {
	if( dev ) {
		console.log( msg )
		console.trace()
	}
}

export const catcher = e => {
	log( e )
	// throw to sentry
	throw e
}

export const ignoreErrors = arr => YellowBox.ignoreWarnings( arr )

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

	// Generate midnight today ( the first second of today, in the past )
	const startofToday = new Date( today )
	startofToday.setHours( 0 )
	startofToday.setMinutes( 0 )
	startofToday.setSeconds( 0 )
	
	// Next day of the type input into the function, also it's first second of that day
	const nextDayOfSuppliedType = startofToday.setDate( startofToday.getDate() + distanceToNextDayType( day ) )
	return new Date( nextDayOfSuppliedType )
}