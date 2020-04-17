import * as Permissions from 'expo-permissions'
import { Platform } from 'react-native'

// Check for camera permissions
export const checkCameraPermissions = f => {
	if( Platform.OS == 'web' ) return Permissions.getAsync( Permissions.CAMERA ).then( ( { granted } ) => granted ).catch( f => false )
	else Permissions.getAsync( Permissions.CAMERA, Permissions.CAMERA_ROLL ).then( ( { granted } ) => granted ).catch( f => false )
}

// Check for and ask if needed
export const confirmOrAskCameraPermissions = async f => {
	if( Platform.OS == 'web' ) return Permissions.askAsync( Permissions.CAMERA ).then( ( { granted } ) => granted ).catch( f => false )
	else return Permissions.askAsync( Permissions.CAMERA, Permissions.CAMERA_ROLL ).then( ( { granted } ) => granted ).catch( f => false )
}