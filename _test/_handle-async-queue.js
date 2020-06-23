// Handle async componentdidmounts
const flushPromises = f => new Promise( res => setImmediate( res ) )

afterEach( async (  ) => {

	await flushPromises()

} )