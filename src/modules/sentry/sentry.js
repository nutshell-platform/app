import * as ExpoSentry from 'sentry-expo'
import { SENTRY_DSN } from '@env'
import { dev, isWeb } from '../apis/platform'

export const SentryInit = f => {

	if( !SENTRY_DSN ) return console.log( 'Missing sentry DSN' )

	ExpoSentry.init( {
		dsn: SENTRY_DSN,
		// enableInExpoDevelopment: true,
		debug: dev
	} )

}

export const Sentry = isWeb ? ExpoSentry.Browser : ExpoSentry.Native