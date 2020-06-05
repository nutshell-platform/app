import { distanceToNextDayType, timestampOfNext, nextMonday } from './helpers'

describe( 'Distance between days calculator', () => {

	it( 'Works for mondays', () => {

		const aMonday = new Date( '2020-06-01' ) // Mon first of june 2020
		
		let result = distanceToNextDayType( 'monday', aMonday )
		expect( result ).toEqual( 0 )

		result = distanceToNextDayType( 'wednesday', aMonday )
		expect( result ).toEqual( 2 )

		result = distanceToNextDayType( 'sunday', aMonday )
		expect( result ).toEqual( 6 )


	} )

	it( 'Works for wednesdays', () => {

		const aWednesday = new Date( '2020-06-03' )
		
		let result = distanceToNextDayType( 'monday', aWednesday )
		expect( result ).toEqual( 5 )

		result = distanceToNextDayType( 'wednesday', aWednesday )
		expect( result ).toEqual( 0 )

		result = distanceToNextDayType( 'sunday', aWednesday )
		expect( result ).toEqual( 4 )


	} )

	it( 'Works for sundays', () => {

		const aSunday = new Date( '2020-06-07' )
		
		let result = distanceToNextDayType( 'monday', aSunday )
		expect( result ).toEqual( 1 )

		result = distanceToNextDayType( 'wednesday', aSunday )
		expect( result ).toEqual( 3 )

		result = distanceToNextDayType( 'sunday', aSunday )
		expect( result ).toEqual( 0 )


	} )

} )