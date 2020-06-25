jest.useFakeTimers()

// Mock date
const currentDate = new Date( '2020-06-23T15:31:29.342Z' )
const realDate = Date

global.Date = class extends Date {

	constructor(date) {

		if (date) {
			return super(date)
		}

		return currentDate
	}
}
Date.now = jest.fn( () => 1592926289342 ) // Equivalent of above