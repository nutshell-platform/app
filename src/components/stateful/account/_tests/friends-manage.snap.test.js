import React from 'react'

import renderer from 'react-test-renderer'

// Module to test
import FriendManager from '../friends-manage'

// Providers
import Providers from '../../test-wrapper'

describe( 'FriendManager', () => {

	it( 'Matches snapshot', () => {


		const element = renderer.create( <Providers>
			<FriendManager />
		</Providers> ).toJSON()
		expect( element ).toMatchSnapshot( )

	} )

} )