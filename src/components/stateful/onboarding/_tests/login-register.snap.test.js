import React from 'react'

import renderer from 'react-test-renderer'

// Module to test
import LoginRegister from '../login-register'

describe( 'Login and registration', () => {

	it( 'Matches snapshot', async () => {


		const element = renderer.create( <LoginRegister /> ).toJSON()
		expect( element ).toMatchSnapshot( )

	} )

} )