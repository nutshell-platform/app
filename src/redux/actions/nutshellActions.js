export const setNutshellDraft = nutshell => ( {
	type: 'SETDRAFT',
	payload: nutshell
} )

export const setNutshellInbox = inbox => ( {
	type: 'SETINBOX',
	payload: inbox
} )