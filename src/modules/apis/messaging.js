import { isWeb, isIos, isAndroid } from './platform'
import * as Linking from 'expo-linking'

// ///////////////////////////////
// Sanitisers
// ///////////////////////////////

// Docs: https://faq.whatsapp.com/iphone/how-to-link-to-whatsapp-from-a-different-app/?lang=fb
export const generateWhatsappLink = ( number, message ) => {

	// Whatsapp docs: Omit any brackets, dashes, plus signs, and leading zeros when adding the phone number in international format.
	const saneNumber = number.replace( /(^\+?0+)|\+|\-|\(|\)/g, '' )

	return `https://wa.me/${ saneNumber }?text=${ encodeURIComponent( message )  }`
}

// Generate xplatform mailto
export const generateMailto = ( to, subject, body ) => {

	// Newlines are handles differently on different ddevides
	const n = ( isWeb && '\n' ) || ( isIos && '<br>' ) || ( isAndroid && '<br><br>' )

	// Add platform newlines and remove tabs ( from code )
	let saneBody = body.replace( /\n/g, n ).replace( /\t/g, '' )
	if( isWeb ) saneBody = encodeURIComponent( saneBody )

	return `mailto:${to}?subject=${subject}&body=${saneBody}`

}

// ///////////////////////////////
// Senders
// ///////////////////////////////

export const sendEmail = ( to, subject, body ) => Linking.openURL( generateMailto( to, subject, body ) )
export const sendWhatsapp = ( number, message ) => Linking.openURL( generateWhatsappLink( number, message ) )