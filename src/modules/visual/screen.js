// Rotation
import * as ScreenOrientation from 'expo-screen-orientation'
import { Platform, Dimensions } from 'react-native'

// Screen rotation
export const setOrientation = async f => {

	// Not web and developing?
	if( Platform.OS != 'web' && process.env.NODE_ENV == 'development' ) {
		// await ScreenOrientation.lockAsync( ScreenOrientation.Orientation.PORTRAIT_DOWN )
		await ScreenOrientation.unlockAsync()
	// Not web and production?
	} else if ( Platform.OS != 'web' ) {
		// Force portrait
		await ScreenOrientation.lockAsync( ScreenOrientation.Orientation.PORTRAIT )
	}
}

class ScreenMan {

	width 	= Math.round( Dimensions.get('window').width )
	height 	= Math.round( Dimensions.get('window').height )

	listener = Dimensions.addEventListener( 'change', ( { window, screen } ) => {
		this.width 		= Math.round( window.width )
		this.height 	= Math.round( window.height )
	} )

}

export const Screen = new ScreenMan()