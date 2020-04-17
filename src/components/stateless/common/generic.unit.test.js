import React from 'react'
import renderer from 'react-test-renderer'

import { Component, Container, Loading } from './generic'

describe( '<Loading />', () => {

  it('Renders a default loading message', () => {

    const loading = renderer.create(<Loading />).toJSON()
    expect( loading.type ).toBe( 'View' )

    const [ text ] = loading.children
    expect( text.type ).toBe( 'Text' )

    const [ message ] = text.children
    expect( message ).toBe( 'Loading' )
    
  } )

  it('Renders a custom loading message', () => {

    const loading = renderer.create( <Loading message='custom' /> ).toJSON()
    expect( loading.type ).toBe( 'View' )

    const [ text ] = loading.children
    expect( text.type ).toBe( 'Text' )

    const [ message ] = text.children
    expect( message ).toBe( 'custom' )
    
  } )

} )

describe( '<Container />', () => {

	it( 'Renders a View', () => {

		const container = renderer.create( <Container /> ).toJSON()
		expect( container.type ).toBe( 'View' )

	} )

} )

describe( '<Component />', () => {

	it( 'Has all expected helper functions', () => {

		const component = new Component()

		const methods = Object.keys( component )
		expect( methods ).toEqual( expect.arrayContaining( [ 'props', 'promiseState', 'updateState' ] ) )

	} )

} )