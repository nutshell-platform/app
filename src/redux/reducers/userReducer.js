export default ( state=null, action ) => {

	const { type, payload } = action

	switch( type ) {

		case "SETUSER":
			return { followers: payload.followers || [], following: payload.following || [], ...state, ...payload  }
		break

		case 'SETUSERMETA':
		case "UPDATEUSER_FULFILLED":
			return { ...state, ...payload }
		break

		// Just return the state if no known action is specified
		default:
			return state
	}
}