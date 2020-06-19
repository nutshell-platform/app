import React from 'react'

import renderer from 'react-test-renderer'

// Module to test
import FAB from '../fab'

// Providers
import Providers from '../../test-wrapper'

describe( 'FAB', () => {

	it( 'Matches snapshot', async () => {


		const element = renderer.create( <Providers>
			<FAB go={ f => f } />
		</Providers> ).toJSON()
		expect( element ).toMatchSnapshot( )

	} )

} )