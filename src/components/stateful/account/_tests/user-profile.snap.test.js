import React from 'react'

import renderer from 'react-test-renderer'

// Module to test
import UserProfile from '../user-profile'

// Redux mocking
import { Provider } from "react-redux"
import configureMockStore from "redux-mock-store"
import { store as dummyStore } from '../../../../modules/dummy-data'
const mockStore = configureMockStore()
const store = mockStore( dummyStore )
const mockParam = { params: { handle: '@person' } }

describe( 'UserProfile', () => {

	it( 'Matches snapshot', () => {


		const element = renderer.create( <Provider store={ store }>
			<UserProfile match={ mockParam } />
		</Provider> ).toJSON()
		expect( element ).toMatchSnapshot( )

	} )

} )