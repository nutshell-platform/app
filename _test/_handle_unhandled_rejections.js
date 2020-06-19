const { promises: fs } = require( 'fs' )

const handle = async e => { 
	await fs.appendFile( 'error.log', `${e}\n` )

	// Swallowing throws, these are things that do not violate the tests but throw in the runtime.
	// Some stupid dependencies think it's clever to put deprecation notices in these.
	// throw e
}

process.on( 'UnhandledPromiseRejectionWarning', handle )
process.on( 'unhandledRejection', handle )
process.on( 'DeprecationWarning', handle )