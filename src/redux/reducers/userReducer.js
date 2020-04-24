export default ( state=null, action ) => {

	const { type, payload } = action

	switch( type ) {

		case "SETUSER":
			return { ...payload, following: [] }
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