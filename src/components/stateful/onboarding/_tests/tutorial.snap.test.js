import React from 'react'

import renderer from 'react-test-renderer'

// Module to test
import Tutorial from '../tutorial'

// Redux mocking
import { Provider } from "react-redux"
import configureMockStore from "redux-mock-store"
const mockStore = configureMockStore()
const store = mockStore( {
	user: {
		name: 'Mentor'
	}
} )

describe( 'Tutorial', () => {

	it( 'Matches snapshot', () => {


		const element = renderer.create( <Provider store={ store }><Tutorial /></Provider> ).toJSON()
		expect( element ).toMatchSnapshot( )

	} )

} )