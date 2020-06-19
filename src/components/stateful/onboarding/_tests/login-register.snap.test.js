import React from 'react'

import renderer from 'react-test-renderer'

// Module to test
import LoginRegister from '../login-register'

// Providers
import Wrapper from '../../test-wrapper'

describe( 'Login and registration', () => {

	it( 'Matches snapshot', async () => {


		const element = renderer.create( <Wrapper>
			<LoginRegister />
		</Wrapper> ).toJSON()
		expect( element ).toMatchSnapshot( )

	} )

} )