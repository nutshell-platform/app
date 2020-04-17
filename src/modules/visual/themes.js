// Theming
import { DefaultTheme as theme } from 'react-native-paper'

export const Light = {
	...theme,
	colors: {
		...theme.colors, divider: 'rgba(0,0,0,.1)',
		primary: 'rgb(0,0,0)'
	},
	roundness: 0,
	dark: false
}
export const Dark = { ...Light,
	dark: true,
	colors: {
		...Light.colors,
		background: 'rgb(50,50,50)',
		surface: 'rgb(120,120,120)',
		text: 'rgb(255,255,255)',
		placeholder: 'rgb(255,255,255)'
	}
}