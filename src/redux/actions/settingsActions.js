export const toggleDarkMode = input => ( {
	type: 'TOGGLEDARKMODE',
	payload: true
} )

export const resetApp = input => ( {
	type: 'RESETAPP',
	payload: true
} )

export const setSettingsAction = settings => ( {
	type: 'SETSETTINGS',
	payload: settings
} )