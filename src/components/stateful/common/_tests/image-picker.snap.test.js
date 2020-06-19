import React from 'react'

import renderer from 'react-test-renderer'

// Module to test
import ShowOrPickImage from '../image-picker'

// Redux mocking
import { Provider } from "react-redux"
import configureMockStore from "redux-mock-store"
import { store as dummyStore } from '../../../../modules/dummy-data'
const mockStore = configureMockStore()
const store = mockStore( dummyStore )

describe( 'ShowOrPickImage without image', () => {

	it( 'Matches snapshot', () => {


		const element = renderer.create( <Provider store={ store }><ShowOrPickImage /></Provider> ).toJSON()
		expect( element ).toMatchSnapshot( )

	} )

} )

describe( 'ShowOrPickImage with image', () => {

	it( 'Matches snapshot', () => {


		const element = renderer.create( <Provider store={ store }><ShowOrPickImage image={ { uri: '/abcd' } } /></Provider> ).toJSON()
		expect( element ).toMatchSnapshot( )

	} )

} )