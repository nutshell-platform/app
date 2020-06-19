import React from 'react'

import renderer from 'react-test-renderer'

// Module to test
import UserProfile from '../user-profile'

// Providers
import Providers from '../../test-wrapper'
const mockParam = { params: { handle: '@person' } }

describe( 'UserProfile', () => {

	it( 'Matches snapshot', () => {


		const element = renderer.create( <Providers>
			<UserProfile match={ mockParam } />
		</Providers> ).toJSON()
		expect( element ).toMatchSnapshot( )

	} )

} )