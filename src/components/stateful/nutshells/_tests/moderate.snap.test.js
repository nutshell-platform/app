import React from 'react'

import renderer from 'react-test-renderer'

// Module to test
import Moderate from '../moderate'

// Providers
import Wrapper from '../../test-wrapper'

describe( 'Moderate', () => {

	it( 'Matches snapshot', async () => {


		const element = renderer.create( <Wrapper>
			<Moderate />
		</Wrapper> ).toJSON()
		expect( element ).toMatchSnapshot( )

	} )

} )