import React from 'react'

import renderer from 'react-test-renderer'

// Module to test
import Navitagion from '../navigation'

// Providers
import Providers from '../../test-wrapper'

describe( 'Navitagion', () => {

	it( 'Matches snapshot', async () => {


		const element = renderer.create( <Providers>
			<Navitagion />
		</Providers> ).toJSON()
		expect( element ).toMatchSnapshot( )

	} )

} )