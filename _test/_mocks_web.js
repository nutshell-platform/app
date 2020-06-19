jest.mock( 'expo', f => ( {  Notifications: {
	createChannelAndroidAsync: f => f,
	addListener: f => f
} } ) )

const crypto = require('crypto')

Object.defineProperty( global.self, 'crypto', {
  value: {
    getRandomValues: arr => crypto.randomBytes( arr.length )
  }
} )

jest.mock( 'expo-font' )