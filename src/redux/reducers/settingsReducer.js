// Theming
import { Light, Dark } from '../../modules/visual/themes'
export default ( state = { theme: Light }, action ) => {

	const { type, payload } = action

	switch( type ) {

		case "TOGGLEDARKMODE":
			return { ...state, theme: state.theme.dark ? Light : Dark }
		break

		// Just return the state if no known action is specified
		default:
			return state
	}
}