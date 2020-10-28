import React, { useState } from 'react'
import { Card, Title, Paragraph, View, HelperText, IconButton, Divider, Button, ToolTip, UserAvatar, Menu } from '../common/generic'

// Helper functions
import { timestampToHuman, dateOfNext } from '../../../modules/helpers'
import { TouchableOpacity } from 'react-native'
import { sendEmail, sendWhatsapp } from '../../../modules/apis/messaging'

export const NutshellCard = ( { nutshell={}, showActions=true, block, report, markRead, avatarSize=100, status=false, follow, unfollow, go, mute, isSelf, isAdmin, deleteNutshell } ) => {

	const { entries, updated, published, user, uid, readcount } = nutshell
	
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
					{ timestampToHuman( published || updated ) }
					{ readcount > 0 && `, read by ${readcount}` }
				</HelperText>

				<View style={ { width: '100%', alignItems: 'flex-start', justifyContent: 'center' } }>
					{ entries.map( entry => <Entry mute key={ entry.uid || Math.random() } entry={ entry } /> ) }
				</View>

			</View>

			{ /* If this is not your nutshell, and it is published */ }
			{ !isSelf && showActions && <NutshellActions gutter={ gutter } archive={ f => markRead( uid ) } contactMethods={ user?.contactMethods } /> }

			{ /* If this is your nutshell and it is not yet published */ }
			{ isSelf && status && <Button style={ { marginHorizontal: gutter } } to='/nutshells/write'>Edit this {status} Nutshell</Button> }


			{ /* Menu dots */ }
			<NutshellOptions isAdmin={ isAdmin } isSelf={ isSelf } deleteNutshell={ f => deleteNutshell( nutshell.uid ) } mute={ f => mute( nutshell.uid ) } block={ f => block( user.uid, uid ) } report={ f => report( uid ) } style={ { position: 'absolute', right: 0, top: 0, marginTop: user ? 0 : -30, zIndex: 1 } } />


		</Card>



	</View>

}


// Single collapsble entry
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

// User contact methods
const NutshellActions = ( { gutter, archive, contactMethods={} } ) => {

	const [ deleting, setDeleting ] = useState( false )
	const sendToArchive = f => {
		archive(  )
		setDeleting( true )
	}

	// Contact methods
	const { whatsapp, email } = contactMethods

	// Button styling
	const buttonStyles = { maxWidth: 118, marginHorizontal: 2 }
	const buttonLabel = { fontSize: 12 }

	const message = 'Hey! I was reading your Nutshell and wanted to respond.'

	// If none, render none
	return <View style={ { alignItems: 'center', justifyContent: 'center', flexDirection: 'row', paddingHorizontal: 5, flexWrap: 'wrap' } }>
		{ whatsapp && <Button labelStyle={ buttonLabel } onPress={ f => sendWhatsapp( whatsapp, message ) } style={ buttonStyles } icon='whatsapp'>WhatsApp</Button> }
		{ email && <Button labelStyle={ buttonLabel } onPress={ f => sendEmail( email, 'Your Nutshell', message ) } style={ buttonStyles } icon='email-plus-outline'>Email</Button> }
		<Button labelStyle={ buttonLabel } style={ buttonStyles } loading={ deleting } icon='archive' onPress={ sendToArchive }>Archive</Button>
	</View>
}

// Placeholder nutshell card
export const Placeholder = ( { hasDraft, status='' } ) => <Card>
	<View style={ { flexDirection: 'column', alignItems: 'center', width: '100%' } }>
		<Title>{ hasDraft ? 'Edit' : 'Draft' } your { `${ status } ` || 'next ' }Nutshell</Title>
		<View style={ { width: '100%', alignItems: 'flex-start', justifyContent: 'center' } }>
			<ToolTip textStyle={ { textAlign: 'center' } } label={ `Next Nutshells release: midnight ${ timestampToHuman( dateOfNext( 'sunday' ) ) }.` }
			info={ `Nutshells are released on sunday midnight. The only reason to come back to this app until then is to draft your own Nutshell. We're not trying to get you hooked, there are plenty of other social networks for that.` } />
			<Button style={ { alignSelf: 'center' } } to='/nutshells/write'>{ hasDraft ? 'Edit' : 'Draft' } your Nutshell</Button>
		</View>

	</View>
</Card>

// View recommendations card
export const ViewRecs = ( { recAmount } ) => <Card>
	<View style={ { flexDirection: 'column', alignItems: 'center', width: '100%' } }>
		{ recAmount > 0 && <Title style={ { textAlign: 'center', marginBottom: 15 } }>You have { recAmount } friend suggestions!</Title> }
		{ !recAmount && <Title style={ { textAlign: 'center', marginBottom: 15 } }>We can help you find your friends!</Title> }
		<View style={ { width: '100%', alignItems: 'flex-start', justifyContent: 'center' } }>
			<HelperText style={ { textAlign: 'center' } }>We use "friends of friends" and optionally your contact book to find your friends.</HelperText>
			<Button style={ { alignSelf: 'center' } } to='/friends/find'>View recommendations</Button>
		</View>

	</View>
</Card>

// Report users
const NutshellOptions = ( { isSelf, style, block, report, mute, deleteNutshell, isAdmin, ...props } ) => {

	const [ isOpen, setOpen ] = useState( false )

	return <TouchableOpacity onPress={ f => setOpen( true ) } style={ { ...style } }>
		<Menu onDismiss={ f => setOpen( false ) } visible={ isOpen } anchor={ <IconButton style={ { opacity: .5, width: 50, height: 50, zIndex: 2 } } onPress={ f => setOpen( true ) } icon="dots-vertical" /> }>
			{ !isSelf && <Menu.Item onPress={ report } title="Report abuse" /> }
			{ !isSelf && <Menu.Item onPress={ block }  title="Block & unfollow this user" /> }
			{ !isSelf && <Menu.Item onPress={ mute }  title="Mute this Nutshell" /> }
			{ ( isSelf || isAdmin ) && <Menu.Item onPress={ deleteNutshell }  title="Delete this Nutshell" /> }
		</Menu>
	</TouchableOpacity>
}
