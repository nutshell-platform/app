import React from 'react'

// Visual
import { Component, Container, Loading } from '../../stateless/common/generic'
import Navigation from '../common/navigation'
import { View } from 'react-native'
import { Settings } from '../../stateless/account/user-settings'
import * as ImageManipulator from "expo-image-manipulator"

// Helpers
import { log, catcher, getuid	 } from '../../../modules/helpers'

// Data
import app from '../../../modules/firebase/app'
import { connect } from 'react-redux'

class UserSettings extends Component {

	constructor( props ) {
		super( props )

		// Existing settings
		const { theme, ...settings } = props.settings

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
	isSensitive = f => { 

		const { user, passwordRequired } = this.state 
		const { user: oldUser } = this.props

		if( user.email && ( user.email != oldUser.email ) || user.newpassword ) return this.updateState( { passwordRequired: true } )

		if( passwordRequired ) return this.updateState( { passwordRequired: false } )

	}

	// Input handlers
	changeUser = ( key, value ) => {

		// Set changed attr and check if pass is required for this change
		if( key != 'handle' ) return this.updateState( { user: { ...this.state.user, [key]: value } } ).then( this.isSensitive )

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

	// Save changes
	saveChanges = async f => {

		const { user, settings, handleAvailable } = this.state
		const { user: originalUser, settings: originalSettings } = this.props
		const { uid } = originalUser

		// Handle is available?
		if( !handleAvailable ) return alert( 'This handle is taken, please choose another' )

		// Avatar processing
		if( user.newavatar ) {

			// Check if extension is valid
			const dataUriExt = user.newavatar.uri.match( /(?:image\/)(.*)(?:;)/ )
			const extension = dataUriExt ? dataUriExt[1] : 'jpg'
			if( ![ 'png', 'jpg', 'jpeg' ].includes( extension ) ) return alert( 'Please select a png or jpg image.' )

			// Compress the image
			const resize = [ { resize: { width: 500, height: 500 } } ]
			const options = { compress: .8 }
			user.newavatar = await ImageManipulator.manipulateAsync( user.newavatar.uri, resize, options )

			// Create file blob for upload
			const file = await fetch( user.newavatar.uri )
			user.newavatar.blob = await file.blob()

			// If extension valid, add path to avatar, extension is always jpg because of the image manipulator's jpeg output
			const path = `avatars/${ uid }-${ await getuid() }.jpg`
			user.newavatar.path = path
		}

		await this.updateState( { loading: true } )

		try {

			// DOuble check handle availability
			const available = await app.handleIsAvailable( user.handle )
			if( !available ) alert( 'This handle is taken, please choose another' )

			await app.updateUser( user )
			// If there were changed, propagate
			if( originalSettings != settings ) await app.updateSettings( settings )
			if( originalUser != user ) await app.updateUser( user )

		} catch( e ) {
			catcher( e )
		} finally {
			await this.updateState( { user: {}, loading: false, passwordRequired: false, handleAvailable: true } )
		}

	}


	render() {

		const { loading, user: newuser, settings: newsettings, passwordRequired, handleAvailable } = this.state
		const { settings, user } = this.props

		if( !user || loading ) return <Loading message={ loading } />

		return <Container>
			<Navigation title='User settings' />
			<Settings handleAvailable={ handleAvailable } passwordRequired={ passwordRequired } user={ { ...user, ...newuser } } changeUser={ this.changeUser } settings={ { ...settings, ...newsettings } } changeSetting={ this.changeSetting } changeNotification={ this.changeNotification } saveChanges={ this.saveChanges } />
		</Container>

	}

}

export default connect( store => ( {
	user: store.user,
	settings: store.settings
} ) )( UserSettings )