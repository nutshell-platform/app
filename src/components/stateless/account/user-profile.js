import React, { useState } from 'react'
import { Card, Main, Title, UserAvatar, Text, Button, View, Menu, IconButton } from '../common/generic'
import { TouchableOpacity } from 'react-native'
import { NutshellCard, Placeholder } from '../nutshells/read'

export const UserCard = ( { children, avatarSize=100, user={}, isSelf, isAdmin, noDraft, following, followMan, nutshells=[], blockPerson, unblockPerson, blocked, mute, deleteNutshell, report } ) => {

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

				{ !isSelf && !blocked && <Button style={ { paddingHorizontal: gutter } } mode={ followed && 'text' } onPress={ f => followMan( followed, setFollowed ) }>{ followed ? 'Unfollow' : 'Follow' }</Button> }
				{ blocked && <Button style={ { paddingHorizontal: gutter } } mode={ 'text' } onPress={ f => unblockPerson( user.uid ) }>Press to unblock</Button> }

				{ /* Menu dots */ }
				{ !isSelf && <BlockUser blocked={ blocked } unblock={ f => unblockPerson( user.uid ) } block={ f => blockPerson( user.uid) } style={ { position: 'absolute', right: 0, top: 0, marginTop: user ? 0 : -30, zIndex: 1 } } /> }


			</Card>

			{ /* isSelf && noDraft && <Placeholder /> */ }
			{ !blocked && nutshells.map( nutshell => <NutshellCard showActions={ false } report={ report } isAdmin={ isAdmin } deleteNutshell={ deleteNutshell } isSelf={ isSelf } mute={ f => mute( nutshell.uid ) } status={ nutshell.status != 'published' ? nutshell.status : false } key={ nutshell.uid } nutshell={ nutshell } /> ) }

		</View>
	</Main.Center>
}

// Report users
const BlockUser = ( { style, blocked, unblock, block, ...props } ) => {

	const [ isOpen, setOpen ] = useState( false )
	const doblock = f => {
		setOpen( false )
		block()
	}
	const doUnblock = f => {
		setOpen( false )
		unblock(  )
	}

	return <TouchableOpacity onPress={ f => setOpen( true ) } style={ { ...style } }>
		<Menu onDismiss={ f => setOpen( false ) } visible={ isOpen } anchor={ <IconButton style={ { opacity: .5, width: 50, height: 50, zIndex: 2 } } onPress={ f => setOpen( true ) } icon="dots-vertical" /> }>
			{ !blocked && <Menu.Item onPress={ doblock } title="block user" /> }
			{ blocked && <Menu.Item onPress={ doUnblock } title="Unblock user" /> }
		</Menu>
	</TouchableOpacity>
}