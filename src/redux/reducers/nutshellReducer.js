import { uniqueByProp } from '../../modules/helpers'

export default ( state = {}, action ) => {

	const { type, payload } = action

	switch( type ) {

		case "SETDRAFT":
			return { ...state, draft: payload || {} }


		case "SETINBOX":
			return { ...state, inbox: payload || [] }

		case "SETARCHIVE":
			return { ...state, archive: payload || [] }


		case "UPDATEOFFLINEINBOX":
			const newNutshells = payload
			const { offline=[], inbox } = state

			// Add the new nutshells to the old ones available offline
			// never keep more than 300 old ones
			return { ...state, offline: uniqueByProp( [ ...offline.slice( 0, 300 ), ...newNutshells ], 'uid' ) }



		// Just return the state if no known action is specified
		default:
			return state
	}
}