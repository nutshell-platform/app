import React from 'react'

import renderer from 'react-test-renderer'

// Module to test
import WriteNutshell from '../write'

// Providers
import Wrapper from '../../test-wrapper'

describe( 'WriteNutshell', () => {

	it( 'Matches snapshot', async () => {


		const element = renderer.create( <Wrapper>
			<WriteNutshell />
		</Wrapper> ).toJSON()
		expect( element ).toMatchSnapshot( )

	} )

} )