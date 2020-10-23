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

// JSDom missing functions
// See: https://jestjs.io/docs/en/manual-mocks
Object.defineProperty( window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  } ) ),
} )