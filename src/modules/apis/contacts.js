import * as Contacts from 'expo-contacts'
import { confirmOrAskContactPermissions } from './permissions'

export const getFingerprints = async f => {

	try {

		const permission = await confirmOrAskContactPermissions()
		const { data } = await Contacts.getContactsAsync( {
          fields: [ Contacts.Fields.Emails, Contacts.Fields.PhoneNumbers, Contacts.Fields.SocialProfiles, Contacts.Fields.InstantMessageAddresses ]
        } )

        // Filter out contacts without useful fingerprints
        const contacts = data.filter( ( { emails, phoneNumbers, instantMessageAddresses, socialProfiles } ) => emails || phoneNumbers || instantMessageAddresses || socialProfiles )


        // Map contacts to fingerprints
        const fingerprints = contacts.map( ( { emails=[], phoneNumbers=[], instantMessageAddresses=[], socialProfiles=[] } ) => {

        	const prints = []

        	// Add emails
        	emails.map( ( { email } ) => prints.push( { type: 'email', fingerprint: email } ) )

        	// Add phone numbers without spaces
        	phoneNumbers.map( ( { number } ) => prints.push( { type: 'phone', fingerprint: number.replace( /\ /g, '' ) } ) )

        	// Add IM addresses
        	instantMessageAddresses.map( ( { service, username } ) => prints.push( { type: 'IM', fingerprint: `${service}/${username}` } ) )

        	// Social profiles
        	socialProfiles.map( ( { service, username } ) => prints.push( { type: 'social', fingerprint: `${service}/${username}` } ) )

        	return prints


        } )

        // Return flat array that is trimmed and lowercased
        return fingerprints.flat().map( print => ( { ...print, fingerprint: print.fingerprint.trim().toLowerCase() } ) )

	} catch( e ) {

		throw e

	}

}

export const another = true