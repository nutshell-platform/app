import { isWeb } from '../apis/platform'

const noGlow = `
textarea, select, input, button {
	-webkit-appearance: none;
	outline: none!important;
}
textarea:focus, select:focus, input:focus, button:focus {
	-webkit-appearance: none;
	outline: none!important;
}
`

export const injectWebCss = f => {

	// Only on web
	if ( !isWeb ) return

	// Inject style
	const style = document.createElement('style')
	style.textContent = `textarea, select, input, button { outline: none!important; }`
	return document.head.append(style)

}

export const another = false