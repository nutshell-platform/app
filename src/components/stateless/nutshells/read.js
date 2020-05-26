import React, { useState } from 'react'
import { timestampToHuman, nextMonday } from '../../../modules/helpers'
import { TouchableOpacity } from 'react-native'
import { Card, Title, Paragraph, View, HelperText, IconButton, Divider, Button, ToolTip, UserAvatar, Menu } from '../common/generic'

export const NutshellCard = ( { nutshell={}, block, report, markRead, avatarSize=100, status=false, follow, unfollow, go, mute } ) => {

	const { entries, updated, user, uid, readcount } = nutshell
	const [ deleting, setDeleting ] = useState( false )
	const gutter = 40

	return <View style={ { ...( user && { paddingVertical: avatarSize/2 } ) } }>

		{ /* Nutshell card */ }
		<Card style={ { paddingTop: user ? 0 : 30, paddingHorizontal: 0 } }>

			{ /* Avatar */ }
			{ user && <TouchableOpacity onPress={ f => go( `/${ user.handle }` ) } style={ { marginTop: -avatarSize/2, marginBottom: 20, width: '100%', alignItems: 'center', justifyContent: 'center' } }>
				<UserAvatar user={ user } size={ avatarSize } />
			</TouchableOpacity> }

			{ /* Nutshell content */ }
			<View style={ { flexDirection: 'column', alignItems: 'center', width: '100%', paddingHorizontal: gutter } }>

				{ user && <Title onPress={ f => go( `/${ user.handle }` ) }>{user.name}</Title> }
				<HelperText style={ { paddingBottom: 10 } }>
					{ user && `@${user.handle}, ` }
					{ timestampToHuman( updated ) }
					{ readcount > 0 && `, read by ${readcount}` }
				</HelperText>

				<View style={ { width: '100%', alignItems: 'flex-start', justifyContent: 'center' } }>
					{ entries.map( entry => <Entry mute key={ entry.uid || Math.random() } entry={ entry } /> ) }
				</View>

			</View>

			{ markRead && <Button style={ { marginHorizontal: gutter } } loading={ deleting } mode='text' onPress={ f => {
				markRead( uid )
				setDeleting( true )
			} }>Mark read</Button> }
			{ status && <Button style={ { marginHorizontal: gutter } } to='/nutshells/write'>Edit this {status} nutshell</Button> }


			{ /* Menu dots */ }
			<ReportNutshell mute={ f => mute( nutshell.uid ) } block={ f => block( user.uid, uid ) } report={ f => report( uid ) } style={ { position: 'absolute', right: 0, top: 0, marginTop: user ? 0 : -30, zIndex: 1 } } />


		</Card>



	</View>

}

export const Entry = ( { entry } ) => {

	const [ open, setOpen ] = useState( false )

	return <View style={ { width: '100%', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' } }>
		<TouchableOpacity onPress={ f => setOpen( !open ) } style={ { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', width: '100%' } }>
			<Title style={ { flexShrink: 1, fontSize: 18 } }>{ entry.title }</Title>
			<IconButton style={ { flexShrink: 1, marginLeft: 'auto' } } size={ 18 } icon={ open ? 'minus' : 'plus' } />
		</TouchableOpacity>

		{ open && <Paragraph style={ { paddingVertical: 20 } }>{ entry.paragraph }</Paragraph> }

	</View>

}

export const Placeholder = ( {  } ) => <Card>
	<View style={ { flexDirection: 'column', alignItems: 'center', width: '100%' } }>
		<Title>You're all caught up! 🎉</Title>
		<View style={ { width: '100%', alignItems: 'flex-start', justifyContent: 'center' } }>
			<ToolTip label={ `The next Nutshell release is ${ timestampToHuman( nextMonday() ) }.` } info={ `Nutshells are released on Mondays. The only reason to come back to this app until then is to draft your own Nutshell. We're not trying to get you hooked, there are plenty of other social networks for that.` } />
			<Button mode='text' style={ { alignSelf: 'center' } } to='/nutshells/write'>Draft & schedule your Nutshell</Button>
		</View>

	</View>
</Card>

// Report users
const ReportNutshell = ( { style, block, report, mute, ...props } ) => {

	const [ isOpen, setOpen ] = useState( false )

	return <TouchableOpacity onPress={ f => setOpen( true ) } style={ { ...style } }>
		<Menu onDismiss={ f => setOpen( false ) } visible={ isOpen } anchor={ <IconButton style={ { opacity: .5, width: 50, height: 50, zIndex: 2 } } onPress={ f => setOpen( true ) } icon="dots-vertical" /> }>
			<Menu.Item onPress={ report } title="Report abuse" />
			<Menu.Item onPress={ block }  title="Block & unfollow this user" />
			<Menu.Item onPress={ mute }  title="Mute this nutshell" />
		</Menu>
	</TouchableOpacity>
}
