import * as Sentry from 'sentry-expo'
import { SENTRY_DSN } from 'react-native-dotenv'
import Constants from 'expo-constants'

const SentryInit = f => {
	if( SENTRY_DSN ) {

		Sentry.init( {
		  dsn: SENTRY_DSN
		  // enableInExpoDevelopment: true
		} )
		
		Sentry.setRelease( Constants.manifest.revisionId )

	 }
}

export default SentryInit