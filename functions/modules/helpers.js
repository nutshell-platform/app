exports.dataFromSnap = ( snapOfDocOrDocs, withDocId=true ) => {

	// If these are multiple docs
	if( snapOfDocOrDocs.docs ) return snapOfDocOrDocs.docs.map( doc => ( { uid: doc.id, ...doc.data( ) } ) )

	// If this is a single document
	return { ...snapOfDocOrDocs.data(), ...( withDocId && { uid: snapOfDocOrDocs.id } ) }

}

// Errors do not behave like objects, so let's make them
const handleErrorType = content => {

	// It this is not an object just let it through
	if( typeof content != 'object' ) return content

	// Create placeholder
	const obj = {}

	// For each property, append to object
	Object.getOwnPropertyNames( content ).map( key => {

		// If the sub property is also an object, recurse so we destructure it too
		if( typeof content[key] == 'object' ) obj[key] = handleErrorType( content[key] )
		else return obj[key] = content[key]
	} )

	return obj
}

exports.log = ( title, content ) => {
	console.log( title, content ? JSON.stringify( handleErrorType( content ), null, process.env.development ? 2 : null ) : '' )
}

exports.error = ( title, content ) => {
	console.log( title, content ? JSON.stringify( handleErrorType( content ), null, process.env.development ? 2 : null ) : '' )
}

// ///////////////////////////////
// Dates
// ///////////////////////////////

// COPIED FROM src/modules/helpers, THAT IS THE MAIN FILE! MAKE EDITS THERE FIRST!

// Baselines
const msInADay = 86400000
const today = new Date()

// profiling the 1st of jan
const oneJan = new Date( today.getFullYear(), 0, 1 )
const oneJanDayType = oneJan.getDay()

exports.timestampToHuman = ms => new Date( ms ).toString().match( /([a-zA-Z]* )([a-zA-Z]* )(\d+)/ )[0]

// Weeks are defined by the number of 7 day increments that have elapsed
exports.weekNumber = f => {

    const daysPassedSinceOneJan = Math.floor( ( today.getTime() - oneJan.getTime() ) / msInADay )

    // Compose week number
    const weekNumber = Math.ceil( ( daysPassedSinceOneJan + oneJanDayType ) / 7 )

    return weekNumber
}

// Calculating the distance until the next day of a week
const distanceToNextDayType = ( targetDay, baseline ) => {

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
exports.distanceToNextDayType = distanceToNextDayType

exports.dateOfNext = day => {


	// Generate midnight today ( the first second of today, in the past )
	const startofToday = new Date( today )
	startofToday.setHours( 0 )
	startofToday.setMinutes( 0 )
	startofToday.setSeconds( 0 )

	
	// Next day of the type input into the function, also it's first second of that day
	const nextDayOfSuppliedType = startofToday.setDate( startofToday.getDate() + distanceToNextDayType( day ) )
	return new Date( nextDayOfSuppliedType )
}