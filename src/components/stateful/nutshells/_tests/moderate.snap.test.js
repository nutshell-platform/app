import React from 'react'

import renderer from 'react-test-renderer'

// Module to test
import Moderate from '../moderate'

// Redux mocking
import { Provider } from "react-redux"
import configureMockStore from "redux-mock-store"
import { store as dummyStore } from '../../../../modules/dummy-data'
const mockStore = configureMockStore()
const store = mockStore( dummyStore )

describe( 'Moderate', () => {

	it( 'Matches snapshot', () => {


		const element = renderer.create( <Provider store={ store }><Moderate /></Provider> ).toJSON()
		expect( element ).toMatchSnapshot( )

	} )

} )