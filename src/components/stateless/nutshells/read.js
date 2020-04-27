import React, { useState } from 'react'
import { timestampToHuman, nextMonday } from '../../../modules/helpers'
import { TouchableOpacity } from 'react-native'
import { Card, Title, Paragraph, View, HelperText, IconButton, Divider, Button, ToolTip, UserAvatar } from '../common/generic'

export const NutshellCard = ( { nutshell={}, avatarSize=100, status=false, follow, unfollow } ) => {

	const { entries, updated, user } = nutshell

	return <View style={ { ...( user && { paddingVertical: avatarSize/2 } ) } }>
		<Card style={ { paddingBottom: 20, paddingTop: user ? 0 : 20 } }>

			{ /* Avatar */ }
			{ user && <View style={ { marginTop: -avatarSize/2, marginBottom: 20, width: '100%', alignItems: 'center', justifyContent: 'center' } }>
				<UserAvatar user={ user } size={ avatarSize } />
			</View> }


			<View style={ { flexDirection: 'column', alignItems: 'center', width: '100%' } }>

				{ user && <Title>{user.name}</Title> }
				<HelperText style={ { paddingBottom: 10 } }>{ user && `@${user.handle}` }{ timestampToHuman( updated ) }</HelperText>

				<View style={ { width: '100%', alignItems: 'flex-start', justifyContent: 'center' } }>
					{ entries.map( entry => <Entry key={ entry.uid } entry={ entry } /> ) }
				</View>

			</View>

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

export const Placeholder = ( {  } ) => <Card style={ { paddingVertical: 20 } }>
	<View style={ { flexDirection: 'column', alignItems: 'center', width: '100%' } }>

		<View style={ { width: '100%', alignItems: 'flex-start', justifyContent: 'center' } }>
			<ToolTip label={ `You have nothing to read until ${ timestampToHuman( nextMonday() ) }.` } info={ `Nutshells are released on mondays. The only reason to come back to this app until then is to draft your own nutshell. We've not trying to get you addicted/hooked, you can to to FB/Insta/Tiktok for that.` } />
			<Button style={ { alignSelf: 'center' } } to='/nutshells/write'>Draft & schedule your nutshell</Button>
		</View>

	</View>
</Card>