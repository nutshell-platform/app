import React from 'react'
import { View } from 'react-native'
import { Card, Main, Title, Input, Button, Subheading, Divider, Toggle, HelperText } from '../common/generic'
import ImagePicker from '../../stateful/common/image-picker'

export const Settings = ( { children, avatarSize=100, user={}, changeUser, settings, changeNotification, changeSetting, saveChanges, passwordRequired } ) => <Main.Center>
	<View style={ { paddingVertical: avatarSize/2 } }>
		<Card style={ { paddingTop: 0, width: 400 } } >
			<ImagePicker image={ user.newavatar || user.avatar } size={ avatarSize } style={ { marginTop: -avatarSize/2, marginBottom: 20 } } onSelected={ image => changeUser( 'newavatar', image ) } />
			<Title style={ { textAlign: 'center' } }>{ user.name || user.email }'s settings</Title>
			<Divider />
			
			{ /* User data */ }
			<Subheading>Account settings</Subheading>
			<Input label='name' value={ user.name } info='This lets your friends find you.' onChangeText={ t => changeUser( 'name', t ) } />
			<Input label='email' value={ user.email } info='Nobody can see this publicly.' onChangeText={ t => changeUser( 'email', t ) } />
			<Input secureTextEntry label='new password' value={ user.newpassword || '' } onChangeText={ t => changeUser( 'newpassword', t ) } />

			{ /* Notification prefs */ }
			<Subheading style={ { marginVertical: 20, flexDirection: 'row' } }>Notification preferences</Subheading>
			<Toggle onToggle={ f => changeNotification( 'writeReminder', !settings.notifications.writeReminder ) } value={ settings.notifications.writeReminder } style={ { marginTop: 10 } } label='Write your nutshell (weekly)' info="You get to write 1 nutshell message per week, this notification reminds you to use it before it expires" />
			<Toggle onToggle={ f => changeNotification( 'readReminder', !settings.notifications.readReminder ) } value={ settings.notifications.readReminder } style={ { marginTop: 10 } } label='Unread nutshells (weekly)' info="A weekly reminder of how many nutshells you have not yet read" />
			<Toggle onToggle={ f => changeNotification( 'newFollower', !settings.notifications.newFollower ) } value={ settings.notifications.newFollower } style={ { marginTop: 10 } } label='New followers (realtime)' info="Get a notification when a new friend starts following you" />
			<Toggle onToggle={ f => changeNotification( 'friendJoined', !settings.notifications.friendJoined ) } value={ settings.notifications.friendJoined } style={ { marginTop: 10 } } label='Friend joined (realtime)' info="Get a notification when a friend joins nutshell" />

			{ /* Password required */ }
			{ passwordRequired && <React.Fragment>
				<Input secureTextEntry label='current password' info='Current password required for this change' error={ true } value={ user.currentpassword || '' } onChangeText={ t => changeUser( 'currentpassword', t ) } />
			</React.Fragment> }
			<Button onPress={ saveChanges }>Save changes</Button>
		</Card>
	</View>

</Main.Center>

export const another = true