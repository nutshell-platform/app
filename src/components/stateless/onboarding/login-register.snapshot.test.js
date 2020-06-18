import React from 'react'
import renderer from 'react-test-renderer'

import Login from './login-register'


describe( 'Login and registration', () => {

	it( 'Matches snapshot', () => {

		const element = renderer.create( <Login /> ).toJSON()
		expect( element ).toMatchSnapshot( )

	} )

} )