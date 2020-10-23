// Theming
export default ( state = {}, action ) => {

	const { type, payload } = action

	switch( type ) {

		case "SETDRAFT":
			return { ...state, draft: payload || {} }
		break

		case "SETINBOX":
			return { ...state, inbox: payload || [] }
		break

		case "UPDATEOFFLINEINBOX":
			const { newNutshells, inbox } = payload

			// Remove offline nutshells no longer in inbox
			const oldWitoutNewlyReadONutshells = [ ...( state.offline || [] ) ].filter( ( { uid } ) => inbox.includes( uid ) )

			// Add the new nutshells to the old ones available offline
			const oldWithNewNutshells = [ ...oldWitoutNewlyReadONutshells, ...newNutshells ]

			return { ...state, offline: [ ...oldWithNewNutshells ] }

		break

		// Just return the state if no known action is specified
		default:
			return state
	}
}