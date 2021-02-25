import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Card, Main, Title, UserAvatar, Text, Button, View, Menu, IconButton } from '../common/generic'
import { TouchableOpacity } from 'react-native'
import { NutshellCard, Placeholder } from '../nutshells/read'
import app from '../../../modules/firebase/app'
import { catcher } from '../../../modules/helpers'

export const UserCard = ( { gutter=25, children, avatarSize=100, user={}, noDraft, nutshells=[] } ) => {

	// Check if user being viewed is me and whether I am an admin
	const myUid = useSelector( store => store?.user?.uid )
	const isSelf = user?.uid == myUid

	// Following management
	const followlist = useSelector( store => store?.user?.following )
	const following = followlist.includes( user.uid )
	const [ followed, setFollowed ] = useState( following )
	const toggleFollowed = f => Promise.all( [
		followed ? app.unfollowPerson( user.uid ) : app.followPerson( user.uid ),
		setFollowed( !following )
	] ).catch( catcher )

	// User blocking
	const blocklist = useSelector( store => store?.user?.blocked || [] )
	const isBlocked = blocklist.includes( user.uid )
	const [ blocked, setBlocked ] = useState( isBlocked )

	return <Main.Center>
		<View nativeID={ `user-profile-${ isSelf ? 'self' : 'other' }` } style={ { paddingVertical: avatarSize/2 } }>
			<Card style={ { paddingTop: 0, width: '100%', paddingHorizontal: 0 } } >

				{ /* Avatar */ }
				<View style={ { marginTop: -avatarSize/2, marginBottom: 20, width: '100%', alignItems: 'center', justifyContent: 'center' } }>
					<UserAvatar user={ user } size={ avatarSize } />
				</View>
				
				{ /* About */ }
				<View style={ { alignItems: 'center', justifyContent: 'center', paddingHorizontal: gutter } }>
					<Title>{ user.name }{ blocked ? ' (blocked)' : '' }</Title>
					<Text>{ user.bio }</Text>
					<Text style={ { marginTop: 10, opacity: .7 } }>Following { user.following?.length || 0 } | Followers { user.followers?.length || 0 }</Text>
				</View>

				{ !isSelf && !blocked && <Button style={ { paddingHorizontal: gutter } } mode={ followed && 'text' } onPress={ toggleFollowed }>{ followed ? 'Unfollow' : 'Follow' }</Button> }

				{ /* Menu dots */ }
				{ !isSelf && <BlockUser blocked={ blocked } setBlocked={ setBlocked } userUid={ user.uid } style={ { position: 'absolute', right: 0, top: 0, marginTop: user ? 0 : -30, zIndex: 1 } } /> }


			</Card>

			{ /* List this user's nutshells */ }
			{ !blocked && nutshells.map( nutshell => <NutshellCard showActions={ false } status={ nutshell.status != 'published' ? nutshell.status : false } key={ nutshell.uid } nutshell={ nutshell } /> ) }

		</View>
	</Main.Center>
}

// Report users
const BlockUser = ( { style, blocked, setBlocked, userUid, ...props } ) => {

	const [ isOpen, setOpen ] = useState( false )
	const doblock = f => {
		setOpen( false )
		setBlocked( true )
		return app.blockPerson( userUid ).catch( catcher )
	}
	const doUnblock = f => {
		setOpen( false )
		setBlocked( false )
		return app.unblockPerson( userUid ).catch( catcher )
	}

	return <TouchableOpacity onPress={ f => setOpen( true ) } style={ { ...style } }>
		<Menu onDismiss={ f => setOpen( false ) } visible={ isOpen } anchor={ <IconButton style={ { opacity: .5, width: 50, height: 50, zIndex: 2 } } onPress={ f => setOpen( true ) } icon="dots-vertical" /> }>
			{ !blocked && <Menu.Item onPress={ doblock } title="block user" /> }
			{ blocked && <Menu.Item onPress={ doUnblock } title="Unblock user" /> }
		</Menu>
	</TouchableOpacity>
}