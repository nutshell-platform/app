import React from 'react'

import renderer from 'react-test-renderer'

// Module to test
import Tutorial from '../tutorial'

// Redux mocking
import Wrapper from '../../test-wrapper'

describe( 'Tutorial', () => {

	it( 'Matches snapshot', async () => {


		const element = renderer.create( <Wrapper>
			<Tutorial />
		</Wrapper> ).toJSON()
		expect( element ).toMatchSnapshot( )

	} )

} )