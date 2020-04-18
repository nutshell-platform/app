import React from 'react'
import { View } from 'react-native'
import { Card, Main, Title, Input, Button, Subheading, Divider, Toggle, HelperText, Text } from '../common/generic'
import ImagePicker from '../../stateful/common/image-picker'

export const Settings = ( { children, avatarSize=100, user={}, changeUser, settings={}, changeNotification, changeSetting, saveChanges, passwordRequired } ) => {

	const newUser = !user?.settings?.notifications
	const newNotiPrefs = settings?.notifications || {}

	return <Main.Center>
		<View style={ { paddingVertical: avatarSize/2 } }>
			<Card style={ { paddingTop: 0, width: 400 } } >
				<ImagePicker image={ user.newavatar || user.avatar } size={ avatarSize } style={ { marginTop: -avatarSize/2, marginBottom: 20 } } onSelected={ image => changeUser( 'newavatar', image ) } />
				<Title style={ { textAlign: 'center' } }>{ !user?.settings?.notifications && 'Welcome ' }{ user.name || user.email }{ user?.settings?.notifications ? '\'s settings' : '!' }</Title>
				{ newUser && <Text style={ { marginTop: 10, textAlign: 'center' } }>Welcome to Nutshell { user.name }! Please let us know if these settings are ok with you, you can change them any time in the 'settings' section.</Text> }
				<Divider />
				
				{ /* User data */ }
				<Subheading>Account settings</Subheading>
				<Input label='name' value={ user.name } info='This lets your friends find you.' onChangeText={ t => changeUser( 'name', t ) } />
				<Input label='email' value={ user.email } info='Nobody can see this publicly.' onChangeText={ t => changeUser( 'email', t ) } />
				<Input secureTextEntry label='new password' value={ user.newpassword || '' } onChangeText={ t => changeUser( 'newpassword', t ) } />

				{ /* Notification prefs */ }
				<Subheading style={ { marginVertical: 20, flexDirection: 'row' } }>Notification preferences</Subheading>
				<Toggle onToggle={ f => changeNotification( 'writeReminder', !newNotiPrefs.writeReminder ) } value={ newNotiPrefs.writeReminder } style={ { marginTop: 10 } } label='Write your nutshell (weekly)' info="You get to write 1 nutshell message per week, this notification reminds you to use it before it expires" />
				<Toggle onToggle={ f => changeNotification( 'readReminder', !newNotiPrefs.readReminder ) } value={ newNotiPrefs.readReminder } style={ { marginTop: 10 } } label='Unread nutshells (weekly)' info="A weekly reminder of how many nutshells you have not yet read" />
				<Toggle onToggle={ f => changeNotification( 'newFollower', !newNotiPrefs.newFollower ) } value={ newNotiPrefs.newFollower } style={ { marginTop: 10 } } label='New followers (realtime)' info="Get a notification when a new friend starts following you" />
				<Toggle onToggle={ f => changeNotification( 'friendJoined', !newNotiPrefs.friendJoined ) } value={ newNotiPrefs.friendJoined } style={ { marginTop: 10 } } label='Friend joined (realtime)' info="Get a notification when a friend joins nutshell" />

				{ /* Password required */ }
				{ passwordRequired && <React.Fragment>
					<Input secureTextEntry label='current password' info='Current password required for this change' error={ true } value={ user.currentpassword || '' } onChangeText={ t => changeUser( 'currentpassword', t ) } />
				</React.Fragment> }
				<Button onPress={ saveChanges }>{ newUser ? 'Confirm settings and continue' : 'Save changes' }</Button>
			</Card>
		</View>
	</Main.Center>
}

export const another = true