import { color, fontSize, merge, StyleSheet } from './_helpers'

describe( 'Style helpers and variables', () => {

	it( 'Colors are al set', () => {

		const colors = Object.keys( color )
		const mandatory = [ 'background', 'text', 'primary', 'accent', 'divider' ]

		expect( colors ).toEqual( expect.arrayContaining( mandatory ) )

	} )

	it( 'Font sizes are all set', () => {

		const sizes = Object.keys( fontSize )
		const mandatory = [ 'h1', 'h2', 'h3', 'p' ]

		expect( sizes ).toEqual( expect.arrayContaining( mandatory ) )


	} )

	it( 'Merge function exists', () => {

		expect( typeof merge ).toBe( 'function' )
		

	} )

	it( 'Style sheet exports', () => {

		const funcs = Object.keys( StyleSheet )
		const mandatory = [ 'flatten', 'hairlineWidth' ]

		expect( funcs ).toEqual( expect.arrayContaining( mandatory ) )

	} )

} )