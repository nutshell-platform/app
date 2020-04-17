import React from 'react'
import { View } from 'react-native'
import { Card, Main, Title, Input, Button } from '../common/generic'
import ImagePicker from '../../stateful/common/image-picker'

export const Settings = ( { children, avatarSize=100, user={}, changeUser, settings, changeSetting, saveChanges, passwordRequired } ) => <Main.Center>
	<View style={ { paddingVertical: avatarSize/2 } }>
		<Card style={ { paddingTop: 0 } } >
			<ImagePicker image={ user.newavatar || user.avatar } size={ avatarSize } style={ { marginTop: -avatarSize/2, marginBottom: 20 } } onSelected={ image => changeUser( 'newavatar', image ) } />
			<Title style={ { textAlign: 'center' } }>{ user.name || user.email }'s settings</Title>
			<Input label='name' value={ user.name } onChangeText={ t => changeUser( 'name', t ) } />
			<Input label='email' value={ user.email } onChangeText={ t => changeUser( 'email', t ) } />
			<Input secureTextEntry label='new password' value={ user.newpassword || '' } onChangeText={ t => changeUser( 'newpassword', t ) } />
			{ passwordRequired && <React.Fragment>
				<Input secureTextEntry label='current password (required)' value={ user.currentpassword || '' } onChangeText={ t => changeUser( 'currentpassword', t ) } />
			</React.Fragment> }
			<Button onPress={ saveChanges }>Save changes</Button>
		</Card>
	</View>

</Main.Center>

export const another = true