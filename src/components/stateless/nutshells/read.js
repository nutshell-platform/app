import React, { useState } from 'react'
import { timestampToHuman, nextMonday } from '../../../modules/helpers'
import { TouchableOpacity } from 'react-native'
import { Card, Title, Paragraph, View, HelperText, IconButton, Divider, Button, ToolTip, UserAvatar } from '../common/generic'

export const NutshellCard = ( { nutshell={}, markRead, avatarSize=100, status=false, follow, unfollow, go } ) => {

	const { entries, updated, user, uid, readcount } = nutshell
	const [ deleting, setDeleting ] = useState( false )

	return <View style={ { ...( user && { paddingVertical: avatarSize/2 } ) } }>
		<Card style={ { paddingTop: user ? 0 : 30 } }>

			{ /* Avatar */ }
			{ user && <TouchableOpacity onPress={ f => go( `/${ user.handle }` ) } style={ { marginTop: -avatarSize/2, marginBottom: 20, width: '100%', alignItems: 'center', justifyContent: 'center' } }>
				<UserAvatar user={ user } size={ avatarSize } />
			</TouchableOpacity> }


			<View style={ { flexDirection: 'column', alignItems: 'center', width: '100%' } }>

				{ user && <Title onPress={ f => go( `/${ user.handle }` ) }>{user.name}</Title> }
				<HelperText style={ { paddingBottom: 10 } }>
					{ user && `@${user.handle}, ` }
					{ timestampToHuman( updated ) }
					{ readcount > 0 && `, read by ${readcount}` }
				</HelperText>

				<View style={ { width: '100%', alignItems: 'flex-start', justifyContent: 'center' } }>
					{ entries.map( entry => <Entry key={ entry.uid } entry={ entry } /> ) }
				</View>

			</View>

			{ markRead && <Button loading={ deleting } mode='text' onPress={ f => {
				markRead( uid )
				setDeleting( true )
			} }>Mark read</Button> }
			{ status && <Button to='/nutshells/write'>Edit this {status} nutshell</Button> }

		</Card>
	</View>

}

export const Entry = ( { entry } ) => {

	const [ open, setOpen ] = useState( false )

	return <View style={ { width: '100%', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' } }>
		<TouchableOpacity onPress={ f => setOpen( !open ) } style={ { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start', width: '100%' } }>
			<Title style={ { fontSize: 18 } }>{ entry.title }</Title>
			<IconButton style={ { marginLeft: 'auto', height: '100%' } } size={ 18 } icon={ open ? 'minus' : 'plus' } />
		</TouchableOpacity>

		{ open && <Paragraph style={ { paddingVertical: 20 } }>{ entry.paragraph }</Paragraph> }
		
	</View>

}

export const Placeholder = ( {  } ) => <Card>
	<View style={ { flexDirection: 'column', alignItems: 'center', width: '100%' } }>

		<View style={ { width: '100%', alignItems: 'flex-start', justifyContent: 'center' } }>
			<ToolTip label={ `Next nutshell release is ${ timestampToHuman( nextMonday() ) }.` } info={ `Nutshells are released on mondays. The only reason to come back to this app until then is to draft your own nutshell. We've not trying to get you addicted/hooked, you can to to FB/Insta/Tiktok for that.` } />
			<Button mode='text' style={ { alignSelf: 'center' } } to='/nutshells/write'>Draft & schedule your nutshell</Button>
		</View>

	</View>
</Card>