export const setUserAction = user => ( {
	type: 'SETUSER',
	payload: user
} )

export const setUserMetaAction = data => ( {
	type: 'SETUSERMETA',
	payload: data
} )