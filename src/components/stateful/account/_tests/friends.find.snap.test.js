import React from 'react'

import renderer from 'react-test-renderer'

// Module to test
import FriendFinder from '../friends-find'

// Providers
import Providers from '../../test-wrapper'

describe( 'FriendFinder', () => {

	it( 'Matches snapshot', () => {

		const element = renderer.create( <Providers>
			<FriendFinder />
		</Providers> ).toJSON()
		expect( element ).toMatchSnapshot( )

	} )

} )