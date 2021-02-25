import React, { useState } from 'react'
import { View } from 'react-native'
import { Card, Main, Title, Input, Button, Subheading, Divider, Toggle, HelperText, Text, Menu, Link } from '../common/generic'
import ImagePicker from '../../stateful/common/image-picker'

export const Settings = ( { children, avatarSize=100, user={}, changeUser, settings={}, changeNotification, changeSetting, deleteAccount, saveChanges, passwordRequired, handleAvailable, changeContactMethod, contactMethods } ) => {

	const newUser = !settings.notifications
	const notiPrefs = settings.notifications || {}

	return <Main.Center>
		<View style={ { paddingVertical: avatarSize/2 } }>

			{ /* About you  */ }
			<Card nativeID='settings-user' style={ { paddingTop: 0, width: 400, alignSelf: 'center' } } >
				<ImagePicker image={ user.newavatar || user.avatar } size={ avatarSize } style={ { marginTop: -avatarSize/2, marginBottom: 20 } } onSelected={ image => changeUser( 'newavatar', image ) } />
				<Title style={ { textAlign: 'center' } }>{ !user?.settings?.notifications && 'Welcome ' }{ user.name || user.email }{ user?.settings?.notifications ? '\'s settings' : '!' }</Title>
				{ newUser && <Text style={ { marginTop: 10, textAlign: 'center' } }>Welcome to Nutshell { user.name }! Please let us know if these settings are ok with you, you can change them any time in the 'settings' section.</Text> }
				<Divider />

				{ /* User data */ }
				<Subheading>About you</Subheading>
				<Input error={ user.name?.length == 0 } label='name' value={ user.name } info='This lets your friends find you.' onChangeText={ t => changeUser( 'name', t ) } />
				<Input error={ !handleAvailable && 'This handle is taken' } label='handle' value={ user.handle } info='Your handle is a unique username you can share with your friends so they can easily find you.' onChangeText={ t => changeUser( 'handle', t ) } />
				<Input nativeID='settings-bio' error={ user.bio?.length == 0 } label='bio' value={ user.bio } info='What should people know about you?' onChangeText={ t => changeUser( 'bio', t ) } />


				{ /* Password required */ }
				{ passwordRequired && <React.Fragment>
					<Input secureTextEntry label='current password' info='Current password required for this change' error={ true } value={ user.currentpassword || '' } onChangeText={ t => changeUser( 'currentpassword', t ) } />
				</React.Fragment> }
				<Button onPress={ saveChanges }>{ newUser ? 'Confirm settings and continue' : 'Save changes' }</Button>
			</Card>

			{ /* Contact preferences */ }
			<Card nativeID='settings-contact' style={ { paddingTop: 0, width: 400, alignSelf: 'center', position: 'relative' } } >


				<Subheading>Contact details</Subheading>
				<HelperText style={ { paddingLeft: 0 } }>These are ways your followers can react to your Nutshells.</HelperText>

				{ /* Add contact methods */ }
			   <Input label='WhatsApp number' value={ contactMethods.whatsapp } info='What is your number including country code?' onChangeText={ t => changeContactMethod( 'whatsapp', t ) } />
			   <Input label='Contact email' value={ user.email || contactMethods.email } info='This does not have to be the same as your account email, but we autofilled it that way' onChangeText={ t => changeContactMethod( 'email', t ) } />

				{ /* Notification prefs */ }
				<Toggle onToggle={ f => changeSetting( 'anyoneCanRespond', !settings.anyoneCanRespond ) } value={ settings.anyoneCanRespond } style={ { marginTop: 10 } } label='Allow all followers to contact you' info="By default only people *you* follow can react to your Nutshells. If you want anyone who follows you to be able to respond to your messages toggle this." />
				{ /* Password required */ }

				<Button onPress={ saveChanges }>{ newUser ? 'Confirm settings and continue' : 'Save changes' }</Button>
			</Card>

			{ /* Account settings */ }
			<Card nativeID='settings-account' style={ { paddingTop: 0, width: 400, alignSelf: 'center' } } >


				<Subheading>Account settings</Subheading>
				<Input label='email' value={ user.email } info='Nobody can see this publicly.' onChangeText={ t => changeUser( 'email', t ) } />
				<Input secureTextEntry label='new password' value={ user.newpassword || '' } onChangeText={ t => changeUser( 'newpassword', t ) } />

				{ /* Notification prefs */ }
				<Subheading style={ { marginVertical: 20, flexDirection: 'row' } }>Notification preferences</Subheading>
				<Toggle onToggle={ f => changeNotification( 'writeReminder', !notiPrefs.writeReminder ) } value={ notiPrefs.writeReminder } style={ { marginTop: 10 } } label='Write your Nutshell (weekly)' info="You get to write one Nutshell per week. This notification reminds you to use it before it expires." />
				<Toggle onToggle={ f => changeNotification( 'readReminder', !notiPrefs.readReminder ) } value={ notiPrefs.readReminder } style={ { marginTop: 10 } } label='Unread Nutshells (weekly)' info="A weekly reminder of how many Nutshells you have not yet read." />
				<Toggle onToggle={ f => changeNotification( 'newFollower', !notiPrefs.newFollower ) } value={ notiPrefs.newFollower } style={ { marginTop: 10 } } label='New followers (real-time)' info="Get a notification when a new friend starts following you." />
				<Toggle onToggle={ f => changeNotification( 'friendJoined', !notiPrefs.friendJoined ) } value={ notiPrefs.friendJoined } style={ { marginTop: 10 } } label='Friend joined (real-time)' info="Get a notification when a friend joins Nutshell." />

				{ /* Password required */ }
				{ passwordRequired && <React.Fragment>
					<Input nativeID='settings-currentpassword' secureTextEntry label='current password' info='Current password required for this change' error={ true } value={ user.currentpassword || '' } onChangeText={ t => changeUser( 'currentpassword', t ) } />
				</React.Fragment> }

				
				{ !user.deleteAccount && <Button onPress={ saveChanges }>{ newUser ? 'Confirm settings and continue' : 'Save changes' }</Button> }
				<DeleteAccount confirmIntent={ f => changeUser( 'deleteAccount', true ) } deleteAccount={ deleteAccount } />

			</Card>


		</View>
	</Main.Center>
}

export const DeleteAccount = ( { confirmIntent, deleteAccount } ) => {

	const [ iamsure, toggleIamsure ] = useState( false )
	const confirm = f => {
		toggleIamsure( true )
		confirmIntent( )
	}

	if( !iamsure ) return <Link nativeID='settings-triggerdelete' underline={ false } style={ { color: 'red', marginTop: 20, textAlign: 'center' } } onPress={ confirm }>Delete account</Link>
	return <Button nativeID='settings-confirmdelete' onPress={ deleteAccount } icon='alert-outline'>Confirm account deletion</Button>
}
