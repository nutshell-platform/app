import React from 'react'

import renderer from 'react-test-renderer'

// Module to test
import UserSettings from '../user-settings'

// Providers
import Providers from '../../test-wrapper'

describe( 'UserSettings', () => {

	it( 'Matches snapshot', () => {


		const element = renderer.create( <Providers>
			<UserSettings />
		</Providers> ).toJSON()
		expect( element ).toMatchSnapshot( )

	} )

} )