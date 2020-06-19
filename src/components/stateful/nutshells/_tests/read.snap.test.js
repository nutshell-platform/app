import React from 'react'

import renderer from 'react-test-renderer'

// Module to test
import ReadNutshell from '../read'

// Providers
import Wrapper from '../../test-wrapper'

describe( 'ReadNutshell', () => {

	it( 'Matches snapshot', async () => {


		const element = renderer.create( <Wrapper>
			<ReadNutshell />
		</Wrapper> ).toJSON()
		expect( element ).toMatchSnapshot( )

	} )

} )