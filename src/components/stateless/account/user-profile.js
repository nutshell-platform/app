import React, { useState, useEffect, memo } from 'react'
import { useSelector } from 'react-redux'
import { Card, Main, Title, Link, UserAvatar, Text, Button, View, Menu, IconButton, ActivityIndicator } from '../common/generic'
import { TouchableOpacity } from 'react-native'
import { NutshellCard, Placeholder } from '../nutshells/read'
import app from '../../../modules/firebase/app'
import { catcher, log } from '../../../modules/helpers'

const UnoptimisedUserCard = ( { gutter=25, children, avatarSize=100, user={}, noDraft, nutshells=[], loading } ) => {

	// Check if user being viewed is me and whether I am an admin
	const self = useSelector( store => store?.user )
	const isSelf = user?.uid == self.uid
	log( 'UserCard: ', user )

	// Following management
	const followlist = useSelector( store => store?.user?.following )
	
	const [ followed, setFollowed ] = useState()
	const [ requestedFollows, setRequestedFollows ] = useState( self.requestedFollows || [] )
	const toggleFollowed = async forceUnfollow => {

		log( `Toggling follow from ${ followed } to ${ !followed } with force set to ${ forceUnfollow }` )
		if( followed || forceUnfollow ) {
			await app.unfollowPerson( user.uid )
			setFollowed( false )
			setRequestedFollows( prev => ( [ ...prev.filter( uid => uid != user.uid ) ] ) )
		}
		else {
			await app.followPerson( user.uid )
			if( user.privateProfile ) setRequestedFollows( prev => ( [ ...prev, user.uid ] ) )
		}

	}


	// On card update, update state
	useEffect( f => {
		const following = followlist.includes( user.uid )
		setFollowed( following )
	}, [ user ] )

	// If requested follows updated remotelu, overwrite local
	useEffect( f => {
		setRequestedFollows( self.requestedFollows || [] )
	}, [ self.requestedFollows ] )

	// User blocking
	const blocklist = useSelector( store => store?.user?.blocked || [] )
	const isBlocked = blocklist.includes( user.uid )
	const [ blocked, setBlocked ] = useState( isBlocked )

	// Loading card
	if( !Object.keys( user ).length ) return <Main.Center>
		<Card key={ `profile-placeholder` }>
					<ActivityIndicator />
		</Card>
	</Main.Center>

	return <Main.Center>
		<View nativeID={ `user-profile-${ isSelf ? 'self' : 'other' }` } style={ { paddingVertical: avatarSize/2 } }>
			<Card style={ { paddingTop: 0, width: '100%', paddingHorizontal: 0 } } >

				{ /* Avatar */ }
				<View style={ { marginTop: -avatarSize/2, marginBottom: 20, width: '100%', alignItems: 'center', justifyContent: 'center' } }>
					<UserAvatar user={ user } size={ avatarSize } />
				</View>
				
				{ /* About */ }
				{ !loading && <View style={ { alignItems: 'center', justifyContent: 'center', paddingHorizontal: gutter } }>
					<Title>{ user.name }{ blocked ? ' (blocked)' : '' }</Title>
					<Text>{ user.bio }</Text>
					<View style={ { marginTop: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' } }>
						<Link to={ isSelf ? '/friends/manage' : `/${ user.handle }/following` } style={ { opacity: .7 } }>Following { user.following?.length || 0 }</Link>
						<Link to={ `/${ user.handle }/followers` } style={ { opacity: .7 } }> | Followers { user.followers?.length || 0 }</Link>
					</View>
				</View> }

				{ /* Either public or no unconfirmed */ }
				{ !loading && !isSelf && !blocked && ( !user.privateProfile || !requestedFollows?.includes( user.uid ) ) && <Button
					style={ { paddingHorizontal: gutter } }
					mode={ followed && 'text' }
					onPress={ f => toggleFollowed() }>
					{ /* Public profile */ }
					{ !user.privateProfile && ( followed ? 'Unfollow' : 'Follow' ) }
					{ /* Private profile: no request pending */ }
					{ user.privateProfile && ( followed ? 'Unfollow' : 'Request follow' ) }
				</Button> }

				{  /* Unconfirmed follow request */ }
				{ user.privateProfile && requestedFollows?.includes( user.uid ) && <Button
					style={ { paddingHorizontal: gutter } }
					mode={ followed && 'text' }
					onPress={ f => toggleFollowed( true ) }>{ 'Cancel follow request' }</Button> }

				{ /* Menu dots */ }
				{ !loading && !isSelf && <BlockUser blocked={ blocked } setBlocked={ setBlocked } userUid={ user.uid } style={ { position: 'absolute', right: 0, top: 0, marginTop: user ? 0 : -30, zIndex: 1 } } /> }


			</Card>

			{ /* List this user's nutshells */ }
			{ loading && [ 0, 1, 2, 3 ].map( i => <Card key={ `nutshell-placeholder-${ i }` }>
					<ActivityIndicator />
			</Card> ) }
			{ !blocked && nutshells.map( nutshell => <NutshellCard showActions={ false } status={ nutshell.status != 'published' ? nutshell.status : false } key={ nutshell.uid } nutshell={ nutshell } /> ) }
			{ user.accessDenied && <Card>
				<Text>This is a private profile, the user needs to manually accept your follow request.</Text>
				{ !self.privateProfile && <Text style={ { marginTop: 20 } }>Do you want a private profile as well? You can enable it in the settings panel.</Text> }
			</Card> }


		</View>
	</Main.Center>
}

export const UserCard = memo( UnoptimisedUserCard, ( prev, next ) => {

	if( prev.nutshells?.length != next.nutshells?.length ) return false
	if( prev.user?.uid != next.user?.uid ) return false

	for( let property in next.user ) {
		if( prev[ property ] != next[ property ] ) return false
	}


	return true

} )

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