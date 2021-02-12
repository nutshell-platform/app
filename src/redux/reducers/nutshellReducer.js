// Theming
export default ( state = {}, action ) => {

	const { type, payload } = action

	switch( type ) {

		case "SETDRAFT":
			return { ...state, draft: payload || {} }


		case "SETINBOX":
			return { ...state, inbox: payload || [] }


		case "UPDATEOFFLINEINBOX":
			const newNutshells = payload

			// Remove offline nutshells no longer in inbox
			const { offline=[], inbox } = state
			const oldWitoutNewlyReadONutshells = [ ...offline ].filter( ( { uid } ) => inbox.includes( uid ) )

			// Add the new nutshells to the old ones available offline
			const oldWithNewNutshells = [ ...oldWitoutNewlyReadONutshells, ...newNutshells ]
			return { ...state, offline: [ ...oldWithNewNutshells ] }



		// Just return the state if no known action is specified
		default:
			return state
	}
}