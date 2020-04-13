import { store , persistor } from './store'

describe( 'Store unit test', () => {

	it( 'Store is valid and has persistor keys', () => {

		const emptyStore = store.getState()
		const keys = Object.keys( emptyStore )
		const mandatory = [ 'reducer', '_persist' ]

		expect( keys ).toEqual( expect.arrayContaining( mandatory ) )

	} )

	it( 'Persistor is valid persistor', () => {

		const keys = Object.keys( persistor )
		const mandatory = [ 'persist', 'purge' ]

		expect( keys ).toEqual( expect.arrayContaining( mandatory ) )

	} )

} )