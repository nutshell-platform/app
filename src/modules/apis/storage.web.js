// This is NOT secure storage, just local storage
const { localStorage } = window

const UnsecureStorage = {
	getItemAsync: key => localStorage.getItem( key ),
	setItemAsync: ( key, value ) => localStorage.setItem( key, value ),
	deleteItemAsync: key => localStorage.removeItem( key )
}

export default UnsecureStorage