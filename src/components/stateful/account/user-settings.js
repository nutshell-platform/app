import React from 'react'

// Visual
import { Component, Container, Loading } from '../../stateless/common/generic'
import Navigation from '../common/navigation'
import { View } from 'react-native'
import { Settings } from '../../stateless/account/user-settings'
import * as ImageManipulator from "expo-image-manipulator"
import Background from '../../../../assets/undraw_personal_settings_kihd.svg'

// Helpers
import { log, catcher, getuid, Dialogue } from '../../../modules/helpers'

// Data
import app from '../../../modules/firebase/app'
import { connect } from 'react-redux'

class UserSettings extends Component {

	constructor( props ) {
		super( props )

		// Existing settings
		const { theme, ...settings } = props.settings
		const { contactMethods } = props.user

		// initialise state
		this.state = {
			loading: false,
			user: {},
			settings: {
				notifications: {
					readReminder: true,
					writeReminder: true,
					newFollower: true,
					friendJoined: true
				},
				...settings
			},
			contactMethods: { ...contactMethods },
			passwordRequired: false,
			handleAvailable: true,
			timeout: 2000
		}

	}

	// Is handle available?
	setAvailable = handle => setTimeout( async f => {
		const { handle: oldHandle } = this.props.user
		try {
			const status = handle.toLowerCase() == oldHandle || await app.handleIsAvailable( handle )
			return this.updateState( { handleAvailable: status } )
		} catch( e ) {
			catcher( e )
		}
	}, this.state.timeout )

	// Sensitive input?
	checkIfIsSensitive = f => { 

		const { user, passwordRequired } = this.state 
		const { user: oldUser } = this.props

		if( user.email && ( user.email != oldUser.email ) || user.newpassword || user.deleteAccount ) return this.updateState( { passwordRequired: true } )

		if( passwordRequired ) return this.updateState( { passwordRequired: false } )

	}

	// Input handlers
	changeUser = ( key, value ) => {

		log( `User change, set ${ key } to: `, value )

		// Set changed attr and check if pass is required for this change
		if( key != 'handle' ) return this.updateState( { user: { ...this.state.user, [key]: value } } ).then( this.checkIfIsSensitive )

		// If handle was changed
		const { user: oldUser } = this.props
		const { validator } = this.state
		const isSame = oldUser?.handle == value

		// Clear old checker
		if( validator ) clearTimeout( validator )

		// Set user attribure and checker
		return this.updateState( {
			user: {
				...this.state.user,
				[key]: value,
				...( isSame && { handleAvailable: isSame } )
			},
			validator: !isSame && this.setAvailable( value )
		} )

	}

	changeSetting 		= ( key, value ) => this.updateState( { settings: { ...this.state.settings, [key]: value } } )
	changeNotification 	= ( key, value ) => this.updateState( { settings: {
		...this.state.settings,
		notifications: {...this.state.settings.notifications, [key]: value }
	} } )
	changeContactMethod = ( key, value ) => this.updateState( { contactMethods: { ...this.state.contactMethods, [key]: value } } )

	// Save changes
	saveChanges = async f => {

		const { user, settings, handleAvailable, contactMethods } = this.state
		const { user: originalUser, settings: originalSettings } = this.props
		const { uid, contactMethods: originalContactMethods } = originalUser

		// Handle is available?
		if( !handleAvailable ) return alert( 'This handle is taken, please choose another' )

		try {

			// Avatar processing
			if( user.newavatar ) {

				// Check if extension is valid
				const dataUriExt = user.newavatar.uri.match( /(?:image\/)(.*)(?:;)/ )
				const extension = dataUriExt ? dataUriExt[1] : 'jpg'
				if( ![ 'png', 'jpg', 'jpeg' ].includes( extension ) ) return alert( 'Please select a png or jpg image.' )

				// Compress the image, setting only width in resize makes height auto
				const resize = [ { resize: { width: 500} } ]
				const options = { compress: .8 }
				user.newavatar = await ImageManipulator.manipulateAsync( user.newavatar.uri, resize, options )

				// Create file blob for upload
				const file = await fetch( user.newavatar.uri )
				user.newavatar.blob = await file.blob()

				// If extension valid, add path to avatar, extension is always jpg because of the image manipulator's jpeg output
				const path = `avatars/${ uid }-${ await getuid() }.jpg`
				user.newavatar.path = path

				// Append old avatar data in order to parse it in the api module
				user.oldavatar = originalUser.avatar
			}

			await this.updateState( { loading: 'Saving settings...' } )

			// Double check handle availability
			if( user.handle ) {
				const available = await app.handleIsAvailable( user.handle )
				if( !available ) return alert( 'This handle is taken, please choose another' )
			}

			// Remote updates
			await app.updateUser( user )

			// If there were changes, propagate
			if( originalSettings != settings ) await app.updateSettings( settings )
			if( originalUser != user ) await app.updateUser( user )

			// Updated contact methods
			const updatedContactMethods = { email: user.email || originalUser.email, ...originalContactMethods, ...contactMethods }
			if( originalContactMethods != updatedContactMethods ) await app.updateContactMethods( updatedContactMethods )

		} catch( e ) {
			catcher( e )
		} finally {
			await this.updateState( { user: {}, loading: false, passwordRequired: false, handleAvailable: true } )
		}

	}

	// Delete accounts
	deleteAccount = async f => {

		const deleteAndLogout = async f => {

			const { user } = this.state
			if( !user.currentpassword ) return Dialogue( 'Missing data', 'Please fill in your current password' )

			try {
				await app.deleteUser( user.currentpassword )
				await Dialogue( 'It was fun having you', 'Your account no longer exists. Goodbye 😢' )
				await app.logout()
			} catch( e ) {
				await Dialogue( 'Something went wrong', e )
				catcher( e )
			}

		}

		try {

			await Dialogue( 'Permanently delete account?', 'This CANNOT BE UNDONE!', [ {
				text: 'Yes, delete my account permanently',
				onPress: deleteAndLogout
			}, {
				text: `Noooo! Don't do it!`,
				onPress: f => this.changeUser( 'deleteAccount', false )
			} ] )

		} catch( e ) {
			catcher( e )
			await Dialogue( 'Error: ', e )
		}

	}


	render() {

		const { loading, user: newuser, settings: newsettings, passwordRequired, handleAvailable, contactMethods } = this.state
		const { settings, user, contactMethods: originalContactMethods } = this.props

		if( !user || loading ) return <Loading message={ loading } />

		return <Container Background={ Background }>
			<Navigation title='Settings' />
			<Settings
				handleAvailable={ handleAvailable }
				passwordRequired={ passwordRequired }
				user={ { ...user, ...newuser } }
				changeUser={ this.changeUser }
				settings={ { ...settings, ...newsettings } }
				changeSetting={ this.changeSetting }
				changeNotification={ this.changeNotification }
				saveChanges={ this.saveChanges }
				changeContactMethod={ this.changeContactMethod }
				contactMethods={ { ...originalContactMethods, ...contactMethods } }
				deleteAccount={ this.deleteAccount }
			/>
		</Container>

	}

}

export default connect( store => ( {
	user: store.user,
	settings: store.settings
} ) )( UserSettings )