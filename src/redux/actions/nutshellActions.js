export const setNutshellDraft = nutshell => ( {
	type: 'SETDRAFT',
	payload: nutshell
} )

export const setNutshellInbox = inbox => ( {
	type: 'SETINBOX',
	payload: inbox
} )

export const setNutshellArchive = archive => ( {
	type: 'SETARCHIVE',
	payload: archive
} )

export const updateOfflineInbox = ( newNutshells=[] ) => ( {
	type: 'UPDATEOFFLINEINBOX',
	payload: newNutshells
} )