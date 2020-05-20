import * as Sentry from '@sentry/browser'
import { SENTRY_DSN } from 'react-native-dotenv'
import Constants from 'expo-constants'

const SentryInit = f => {
	if( SENTRY_DSN ) {

		Sentry.init( {
		  dsn: SENTRY_DSN
		  // enableInExpoDevelopment: true
		} )

		// // Doesn't work in web
		// Sentry.setRelease( Constants.manifest.revisionId )

	 }
}

export default SentryInit