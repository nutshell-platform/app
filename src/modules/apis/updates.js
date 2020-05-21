import * as Updates from 'expo-updates'
import * as Network from 'expo-network'
import { log, catcher, Dialogue } from '../helpers'
import { dev } from '../apis/platform'

const connectivityCheck = f => Network.getNetworkStateAsync().then( ( { isInternetReachable } ) => isInternetReachable ).catch( f => false )

export const updateAvailable = async f => {
	const internet = await connectivityCheck()
	if( internet ) return Updates.checkForUpdateAsync().then( ( { isAvailable } ) => isAvailable ).catch( f => false )
	else return false
}

export const updateIfAvailable = async f => {

	if( dev ) return log( `Update checking triggered, doesn't work in development mode though` )

	const available = await updateAvailable()
	if( !available ) return false
	
	try {
		await Updates.fetchUpdateAsync()
		await Dialogue( 'An update is available!', 'Do you want to restart the app now?', [{
			text: 'Yes, restart',
			onPress: f => Updates.reloadAsync()
		} ] )
		return true
	} catch( e ) {
		catcher( e )
	}



}