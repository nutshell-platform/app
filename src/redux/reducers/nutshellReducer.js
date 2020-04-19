// Theming
export default ( state = {}, action ) => {

	const { type, payload } = action

	switch( type ) {

		case "SETDRAFT":
			return { ...state, draft: payload || {} }
		break


		// Just return the state if no known action is specified
		default:
			return state
	}
}