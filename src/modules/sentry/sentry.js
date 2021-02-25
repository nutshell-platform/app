import * as ExpoSentry from 'sentry-expo'
import { SENTRY_DSN } from '@env'
import Constants from 'expo-constants'

export const SentryInit = f => {
	if( SENTRY_DSN ) {

		ExpoSentry.init( {
			dsn: SENTRY_DSN
			// enableInExpoDevelopment: true
		} )

		// Doesn't work on web, only expo's package
		if( Constants?.manifest?.revisionId ) ExpoSentry.setRelease( Constants.manifest.revisionId )

	}
}

export const Sentry = ExpoSentry
