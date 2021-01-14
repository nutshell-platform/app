import * as Sentry from 'sentry-expo'
import { SENTRY_DSN } from '@env'
import Constants from 'expo-constants'

const SentryInit = f => {
	if( SENTRY_DSN ) {

		Sentry.init( {
			dsn: SENTRY_DSN
			// enableInExpoDevelopment: true
		} )

		// Doesn't work on web, only expo's package
		if( Constants?.manifest?.revisionId ) Sentry.setRelease( Constants.manifest.revisionId )

	}
}

export default SentryInit