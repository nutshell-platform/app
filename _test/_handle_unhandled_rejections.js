const { promises: fs } = require( 'fs' )

const handle = async e => { 
	await fs.appendFile( 'error.log', `${e}\n` )
	throw e
}

process.on( 'UnhandledPromiseRejectionWarning', handle )
process.on( 'unhandledRejection', handle )
process.on( 'DeprecationWarning', handle )