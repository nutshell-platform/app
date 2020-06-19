import React from 'react'

import renderer from 'react-test-renderer'

// Module to test
import WriteNutshell from '../write'

// Redux mocking
import { Provider } from "react-redux"
import configureMockStore from "redux-mock-store"
import { store as dummyStore } from '../../../../modules/dummy-data'
const mockStore = configureMockStore()
const store = mockStore( dummyStore )

describe( 'WriteNutshell', () => {

	it( 'Matches snapshot', () => {


		const element = renderer.create( <Provider store={ store }><WriteNutshell /></Provider> ).toJSON()
		expect( element ).toMatchSnapshot( )

	} )

} )