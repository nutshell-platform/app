import * as SecureStore from 'expo-secure-store'

export const getPushToken = f => SecureStore.getItemAsync( 'pushtoken' )

export const savePushToken = async token => {
	// This is where you do logic to save your push token on your backend
}