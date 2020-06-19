import React from 'react'

import renderer from 'react-test-renderer'

// Module to test
import Report from '../report'

// Providers
import Wrapper from '../../test-wrapper'
const mockParam = { params: { handle: '@person' } }

describe( 'Report', () => {

	it( 'Matches snapshot', async () => {


		const element = renderer.create( <Wrapper>
			<Report match={ mockParam } />
		</Wrapper> ).toJSON()
		expect( element ).toMatchSnapshot( )

	} )

} )