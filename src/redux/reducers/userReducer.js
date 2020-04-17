export default ( state=null, action ) => {

	const { type, payload } = action

	switch( type ) {

		case "SETUSER":
		case "UPDATEUSER_FULFILLED":
			return payload
		break

		// Just return the state if no known action is specified
		default:
			return state
	}
}