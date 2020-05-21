import React, { useState } from 'react'
import { Card, Main, Title, UserAvatar, Text, Button, View, Menu, IconButton } from '../common/generic'
import { TouchableOpacity } from 'react-native'
import { NutshellCard, Placeholder } from '../nutshells/read'

export const UserCard = ( { children, avatarSize=100, user={}, isSelf, noDraft, following, followMan, nutshells=[], mutePerson, unmutePerson, muted } ) => {

	const [ followed, setFollowed ] = useState( following )
	const gutter = 25

	return <Main.Center>
		<View style={ { paddingVertical: avatarSize/2 } }>
			<Card style={ { paddingTop: 0, width: '100%', paddingHorizontal: 0 } } >

				{ /* Avatar */ }
				<View style={ { marginTop: -avatarSize/2, marginBottom: 20, width: '100%', alignItems: 'center', justifyContent: 'center' } }>
					<UserAvatar user={ user } size={ avatarSize } />
				</View>
				
				{ /* About */ }
				<View style={ { alignItems: 'center', justifyContent: 'center', paddingHorizontal: gutter } }>
					<Title>{ user.name }</Title>
					<Text>{ user.bio }</Text>
					<Text style={ { marginTop: 10, opacity: .7 } }>Following { user.following?.length || 0 } | Followers { user.followers?.length || 0 }</Text>
				</View>

				{ !isSelf && !muted && <Button style={ { paddingHorizontal: gutter } } mode={ followed && 'text' } onPress={ f => followMan( followed, setFollowed ) }>{ followed ? 'Unfollow' : 'Follow' }</Button> }
				{ muted && <Button style={ { paddingHorizontal: gutter } } mode={ 'text' } onPress={ f => unmutePerson( user.uid ) }>Press to unmute</Button> }

				{ /* Menu dots */ }
				<MuteUser muted={ muted } unmute={ f => unmutePerson( user.uid ) } mute={ f => mutePerson( user.uid) } style={ { position: 'absolute', right: 0, top: 0, marginTop: user ? 0 : -30, zIndex: 1 } } />


			</Card>

			{ isSelf && noDraft && <Placeholder /> }

			{ !muted && nutshells.map( nutshell => <NutshellCard status={ nutshell.status != 'published' ? nutshell.status : false } key={ nutshell.uid } nutshell={ nutshell } /> ) }

		</View>
	</Main.Center>
}

// Report users
const MuteUser = ( { style, muted, unmute, mute, ...props } ) => {

	const [ isOpen, setOpen ] = useState( false )
	const doMute = f => {
		setOpen( false )
		mute()
	}
	const doUnmute = f => {
		setOpen( false )
		unmute(  )
	}

	return <TouchableOpacity onPress={ f => setOpen( true ) } style={ { ...style } }>
		<Menu onDismiss={ f => setOpen( false ) } visible={ isOpen } anchor={ <IconButton style={ { opacity: .5, width: 50, height: 50, zIndex: 2 } } onPress={ f => setOpen( true ) } icon="dots-vertical" /> }>
			{ !muted && <Menu.Item onPress={ doMute } title="Mute user" /> }
			{ muted && <Menu.Item onPress={ doUnmute } title="Unmute user" /> }
		</Menu>
	</TouchableOpacity>
}