import React from 'react'

// Visual
import { Component, Container, Loading, Main } from '../../stateless/common/generic'
import Navigation from '../../stateful/common/navigation'
import { Login } from '../../stateless/onboarding/login-register'
import Park from '../../../../assets/undraw_through_the_park_lxnl.svg'


// Data
import { log } from '../../../modules/helpers'
import app from '../../../modules/firebase/app'

export default class LoginRegister extends Component {

	// initialise state
	state = {
		action: 'login',
		name: '',
		handle: '',
		email: '',
		password: '',
		available: true,
		loading: false,
		timeout: 2000
	}

	// set handle availabilisy
	setAvailable = handle => setTimeout( async f => {
		try {
			const status = await app.handleIsAvailable( handle )
			return this.updateState( { available: status } )
		} catch( e ) {
			catcher( e )
		}
	}, this.state.timeout )

	// Input handler
	onInput = ( key, value ) => {

		const { action, validator } = this.state
		// If not handle, just udate
		if( key != 'handle' ) return this.updateState( { [key]: value } )

		// If register, check if handle is available then update
		const handleSet = value?.length > 0
		if( handleSet ) clearTimeout( validator )

		const saneHandle = value[0] == '@' ? value.substring( 1 ) : value
		return this.updateState( { [key]: saneHandle, available: true, validator: handleSet && this.setAvailable( saneHandle ) } )


	}

	// Log/reg toggle
	toggleAction = action => this.updateState( { action: action || ( this.state.action == 'login' ? 'register' : 'login' ) } )

	// Validate input
	validate = f => {
		const { action, email, password, name, handle, available } = this.state
		if( !email ) return 'Please fill in your email address'
		if( action != 'recover' && !password ) return 'Please fill in your password'
		if( action == 'register' && !name ) return 'Please fill in your name'
		if( action == 'register' && !handle ) return 'Please choose a handle'
		if( action == 'register' && !available ) return 'That handle is taken!'

		return false
	}

	// Handle account/session
	onSubmit = async f => {

		// Validate input
		const missing = this.validate()
		if( missing ) return alert( missing )

		const { action, email, password, name, handle } = this.state
		const { history } = this.props

		await this.updateState( { loading: `Best app ${action} ever...` } )

		try {
			if( action == 'login' ) await app.loginUser( email.trim(), password )
			if( action == 'register' ) await app.registerUser( name.trim(), handle.trim(), email.trim(), password )
			if( action == 'recover' ) await app.resetPassword( email.trim() )
			return history.push( '/' )
		} catch( e ) {
			log( e )
			alert( e )
			return this.updateState( { loading: false } )
		}
	}

	render() {

		const { action, email, password, name, handle, loading, available } = this.state
		const { history } = this.props

		if( loading ) return <Loading message={ loading } />

		return <Container Background={ Park }>
			<Navigation title={ action } />
			<Main.Center>
				<Login name={ name } handle={ handle } email={ email } password={ password } available={ available } onInput={ this.onInput } proceed={ this.onSubmit } toggle={ this.toggleAction } action={ action } />
			</Main.Center>
		</Container>

	}

}