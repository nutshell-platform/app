// Rotation
import * as ScreenOrientation from 'expo-screen-orientation'
import { Dimensions } from 'react-native'
import { isWeb, dev, isAndroid } from '../apis/platform'

// Screen rotation
export const setOrientation = async f => {

	// Not web and developing?
	if( !isWeb && dev ) {
		if( isAndroid ) await ScreenOrientation.lockAsync( ScreenOrientation.OrientationLock.PORTRAIT_DOWN )
		await ScreenOrientation.unlockAsync()
	// Not web and production?
	} else if ( !isWeb ) {
		// Force portrait
		await ScreenOrientation.lockAsync( ScreenOrientation.OrientationLock.PORTRAIT )
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