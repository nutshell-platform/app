import { StyleSheet } from 'react-native'

export const color = {
	background: '#FFFFFF',
	text: {
		light: "#BDBDBD",
		secondary: "#757575",
		dark: "#212121"
	},
	primary: {
		light: "#C5CAE9",
		dark: "#303F9F",
		normal: "#3F51B5"
	},
	accent: "#FDB441",
	divider: "#BDBDBD"
}

export const fontSize = {
	h1: 20,
	h2: 18,
	h3: 16,
	p: 15
}

export const merge = function() { return StyleSheet.flatten( Array.from( arguments ) ) }

export { StyleSheet } from 'react-native'