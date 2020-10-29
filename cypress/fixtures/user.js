const random = ( length=10 ) => `${ Math.round( Math.random() * ( 10 ** length ) ) }`

module.exports = {
	name: 'Test McTestface',
	handle: `testy${random()}`,
	email: `${random()}-test@${random()}-test.com`,
	password: `password`
}