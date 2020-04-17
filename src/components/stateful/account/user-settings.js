import React from 'react'

// Visual
import { Component, Container, Loading } from '../../stateless/common/generic'
import Navigation from '../../stateful/common/navigation'
import { View } from 'react-native'
import { Settings } from '../../stateless/account/user-settings'
import * as ImageManipulator from "expo-image-manipulator"

// Helpers
import { log, catcher, getuuid	 } from '../../../modules/helpers'

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
			passwordRequired: false
		}
	}


	// Sensitive input?
	isSensitive = f => { 

		const { user, passwordRequired } = this.state 
		const { user: oldUser } = this.props

		if( user.email && ( user.email != oldUser.email ) || user.newpassword ) return this.updateState( { passwordRequired: true } )

		if( passwordRequired ) return this.updateState( { passwordRequired: false } )

	}

	// Input handlers
	changeUser 			= ( key, value ) => this.updateState( { user: { ...this.state.user, [key]: value } } ).then( this.isSensitive )
	changeSetting 		= ( key, value ) => this.updateState( { settings: { ...this.state.settings, [key]: value } } )
	changeNotification 	= ( key, value ) => this.updateState( { settings: {
		...this.state.settings,
		notifications: {...this.state.settings.notifications, [key]: value }
	} } )

	// Save changes
	saveChanges = async f => {

		const { user, settings } = this.state
		const { uid, settings: originalSettings } = this.props.user

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
			const path = `avatars/${ uid }-${ await getuuid() }.jpg`
			user.newavatar.path = path
		}

		// Append settings to user if they changes
		if( originalSettings != settings ) user.settings = settings

		await this.updateState( { loading: true } )

		try {
			await app.updateUser( user )
		} catch( e ) {
			catcher( e )
		} finally {
			await this.updateState( { user: {}, loading: false, passwordRequired: false } )
		}

	}


	render() {

		const { loading, user: newuser, settings: newsettings, passwordRequired } = this.state
		const { settings, user } = this.props

		if( !user || loading ) return <Loading message={ loading } />

		return <Container>
			<Navigation title='User settings' />
			<Settings passwordRequired={ passwordRequired } user={ { ...user, ...newuser } } changeUser={ this.changeUser } settings={ { ...settings, ...newsettings } } changeSetting={ this.changeSetting } changeNotification={ this.changeNotification } saveChanges={ this.saveChanges } />
		</Container>

	}

}

export default connect( store => ( {
	user: store.user,
	settings: store.settings
} ) )( UserSettings )