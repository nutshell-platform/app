import React from 'react'
import { View } from 'react-native'
import { Card, Input, Button, Divider, Text } from '../common/generic'

export const Login = ( { toggle, proceed, onInput, action='login', name, handle, email, password, available } ) => <Card>
		{ action == 'register' && <Input onSubmit={ proceed } value={ name } onChangeText={ t => onInput( 'name', t ) } label='name' /> }
		{ action == 'register' && <Input onSubmit={ proceed } error={ !available && 'This handle is taken' } info={ 'Your handle is a unique username you can share with your friends so they can easily find you.' } value={ handle } onChangeText={ t => onInput( 'handle', t ) } label='username/handle' /> }
		<Input onSubmit={ proceed } value={ email } onChangeText={ t => onInput( 'email', t ) } label='email' />
		{ action != 'recover' && <Input onSubmit={ proceed } value={ password } onChangeText={ t => onInput( 'password', t ) } secureTextEntry={ true } label='password' /> }
		<Button onPress={ proceed } icon='login' mode='contained' style={ { marginTop: 20 } }>{ action } now</Button>
		<Button onPress={ f => toggle() } icon={ action == 'login' ? 'account-plus' : 'login' } mode='text' style={ { marginTop: 20 } }>{ action == 'login' ? 'register' : 'login' } instead</Button>
		<Text onPress={ f => toggle( 'recover' ) } style={ { textAlign: 'center', marginTop: 20, opacity: .6 } }>Forgot password?</Text>
</Card>

export const another = true