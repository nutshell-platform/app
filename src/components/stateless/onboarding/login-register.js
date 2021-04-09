import React, { useState } from 'react'
import { View } from 'react-native'
import { Card, Input, Button, Divider, Text, Checkbox, Link } from '../common/generic'
import { wait } from '../../../modules/helpers'

export const Login = ( { toggle, proceed, onInput, action='login', name, handle, email, password, available, tos } ) => {

	const [ loading, setLoading ] = useState( false )
	const onSubmit = async f => {

		if( loading ) return

		try {
			setLoading( true )
			await proceed()

		} finally {
			setLoading( false )
		}

	}

	return <Card>

			{ /* User input */ }
			{ action == 'register' && <Input nativeID='loginreg-name' autoCompleteType='name' onSubmit={ proceed } value={ name } onChangeText={ t => onInput( 'name', t ) } label='name' /> }
			{ action == 'register' && <Input nativeID='loginreg-username' autoCompleteType='username' autoCapitalize='none' onSubmit={ proceed } error={ !available && 'This handle is taken' } info={ 'Your handle is a unique username you can share with your friends so they can easily find you.' } value={ handle } onChangeText={ t => onInput( 'handle', t ) } label='username/handle' /> }
			<Input nativeID='loginreg-email' autoCompleteType='email' autoCapitalize='none' onSubmit={ proceed } value={ email } onChangeText={ t => onInput( 'email', t ) } label='email' keyboardType='email-address'/>
			{ action != 'recover' && <Input autoCompleteType='password' nativeID='loginreg-password' autoCapitalize='none' onSubmit={ proceed } value={ password } onChangeText={ t => onInput( 'password', t ) } secureTextEntry={ true } label='password' /> }

			{ action == 'register' && <Checkbox nativeID='loginreg-toc' onPress={ f => onInput( 'tos', !tos ) } checked={ tos } style={ { marginTop: 10 } }>
				<Text onPress={ f => onInput( 'tos', !tos ) }>I accept the </Text>
				<Link to='https://nutshell.social/terms-of-service.html'>terms of service.</Link>
			</Checkbox> }
			
			{ /* Actions */ }

			<Button loading={ loading } nativeID='loginreg-submit' onPress={ onSubmit } icon='login' mode='contained' style={ { marginTop: 20 } }>
				{ !loading && `${ action } now` }
				{ loading && ( action == 'register' ? 'Registering' : 'Logging in' ) }
			</Button>
			<Button nativeID='loginreg-toggle' onPress={ f => toggle() } icon={ action == 'login' ? 'account-plus' : 'login' } mode='text' style={ { marginTop: 20 } }>{ action == 'login' ? 'register' : 'login' } instead</Button>
			<Text nativeID='loginreg-forgotpassword' onPress={ f => toggle( 'recover' ) } style={ { textAlign: 'center', marginTop: 20, opacity: .6 } }>Forgot password?</Text>
	</Card>
}

export const another = true
