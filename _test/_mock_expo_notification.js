jest.mock( 'expo', f => ( {  Notifications: {
	createChannelAndroidAsync: f => f,
	addListener: f => f
} } ) )
