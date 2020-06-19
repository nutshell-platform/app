import React from 'react'

import renderer from 'react-test-renderer'

// Module to test
import Report from '../report'

// Redux mocking
import { Provider } from "react-redux"
import configureMockStore from "redux-mock-store"
import { store as dummyStore } from '../../../../modules/dummy-data'
const mockStore = configureMockStore()
const store = mockStore( dummyStore )

describe( 'Report', () => {

	it( 'Matches snapshot', () => {


		const element = renderer.create( <Provider store={ store }><Report /></Provider> ).toJSON()
		expect( element ).toMatchSnapshot( )

	} )

} )