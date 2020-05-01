import React, { useState } from 'react'
import { Card, Main, Title, UserAvatar, Text, Button, View } from '../common/generic'
import { NutshellCard, Placeholder } from '../nutshells/read'

export const UserCard = ( { children, avatarSize=100, user={}, isSelf, noDraft, following, followMan, nutshells=[] } ) => {

	const [ followed, setFollowed ] = useState( following )

	return <Main.Center>
		<View style={ { paddingVertical: avatarSize/2 } }>
			<Card style={ { paddingTop: 0, width: '100%' } } >

				{ /* Avatar */ }
				<View style={ { marginTop: -avatarSize/2, marginBottom: 20, width: '100%', alignItems: 'center', justifyContent: 'center' } }>
					<UserAvatar user={ user } size={ avatarSize } />
				</View>
				
				{ /* About */ }
				<View style={ { alignItems: 'center', justifyContent: 'center' } }>
					<Title>{ user.name }</Title>
					<Text>{ user.bio }</Text>
					<Text style={ { marginTop: 10, opacity: .7 } }>Following { user.following?.length || 0 } | Followers { user.followers?.length || 0 }</Text>
				</View>

				{ !isSelf && <Button mode={ followed && 'text' } onPress={ f => followMan( followed, setFollowed ) }>{ followed ? 'Unfollow' : 'Follow' }</Button> }

			</Card>

			{ isSelf && noDraft && <Placeholder /> }

			{ nutshells.map( nutshell => <NutshellCard status={ nutshell.status != 'published' ? nutshell.status : false } key={ nutshell.uid } nutshell={ nutshell } /> ) }

		</View>
	</Main.Center>
}

export const another = true