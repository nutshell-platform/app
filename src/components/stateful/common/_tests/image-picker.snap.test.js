import React from 'react'

import renderer from 'react-test-renderer'

// Module to test
import ShowOrPickImage from '../image-picker'

// Providers
import Providers from '../../test-wrapper'

describe( 'ShowOrPickImage without image', () => {

	it( 'Matches snapshot', async () => {


		const element = renderer.create( <Providers>
			<ShowOrPickImage />
		</Providers> ).toJSON()
		expect( element ).toMatchSnapshot( )

	} )

} )

describe( 'ShowOrPickImage with image', () => {

	it( 'Matches snapshot', async () => {


		const element = renderer.create( <Providers>
			<ShowOrPickImage image={ { uri: '/abcd' } } />
		</Providers> ).toJSON()
		expect( element ).toMatchSnapshot( )

	} )

} )