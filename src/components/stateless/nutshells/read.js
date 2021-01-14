import React, { useState } from 'react'
import { Card, Title, Paragraph, View, HelperText, IconButton, Button, ToolTip, UserAvatar, Menu } from '../common/generic'

// Hooks
import { useSelector } from 'react-redux'
import { useHistory } from '../../../routes/router'
import app from '../../../modules/firebase/app'

// Helper functions
import { timestampToHuman, dateOfNext, catcher } from '../../../modules/helpers'
import { TouchableOpacity } from 'react-native'
import { sendEmail, sendWhatsapp } from '../../../modules/apis/messaging'

export const NutshellCard = ( { gutter=40, index, nutshell={}, showActions=true, avatarSize=100, status=false } ) => {

	// Extract data
	const { entries, updated, published, user, uid, readcount } = nutshell

	// Check if this is my nutshell
	const myUid = useSelector( store => store?.user?.uid )
	const isSelf = user?.uid == myUid

	// Helpers
	const history = useHistory()
	const go = to => to && history.push( to )

	// Preventing self render, used by the underlying menu
	const [ selfIsHidden, hideSelf ] = useState( false )
	if( selfIsHidden ) return null

	// Mark nutshell as read
	function markRead() {

		hideSelf( true )
		return app.markNutshellRead( uid )
		
	}

	return <View style={ { ...( user && { paddingVertical: avatarSize/2 } ) } }>

		{ /* Nutshell card */ }
		<Card nativeID={ `nutshell-card-${index}` } style={ { paddingTop: user ? 0 : 30, paddingHorizontal: 0 } }>

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
			{ !isSelf && showActions && <NutshellActions gutter={ gutter } archive={ markRead } contactMethods={ user?.contactMethods } /> }

			{ /* If this is your nutshell and it is not yet published */ }
			{ isSelf && status && <Button style={ { marginHorizontal: gutter } } to='/nutshells/write'>Edit this {status} Nutshell</Button> }


			{ /* Menu dots */ }
			<NutshellOptions hideSelf={ hideSelf } isSelf={ isSelf } nutshell={ nutshell } style={ { position: 'absolute', right: 0, top: 0, marginTop: user ? 0 : -30, zIndex: 1 } } />


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
const NutshellOptions = ( { nutshell, hideSelf, isSelf, style, ...props } ) => {

	// Data
	const isAdmin = useSelector( store => store?.user?.admin )
	const { uid: nutshellUid, user } = nutshell

	// ///////////////////////////////
	// States
	// ///////////////////////////////
	const [ blocking, setBlocking ] = useState( false )
	const [ muting, setMuting ] = useState( false )
	const [ deleting, setDeleting ] = useState( false )
	const [ isOpen, setOpen ] = useState( false )

	// ///////////////////////////////
	// Menu functionality
	// ///////////////////////////////
	const history = useHistory()

	// Block user
	async function block() {

		setBlocking( true )
		await Promise.all( [ app.unfollowPerson( user.uid ), app.blockPerson( user.uid ) ] ).catch( catcher )
		setBlocking( false )
		hideSelf( true )

	}

	// Report nutshell
	const report = f => history.push( `/nutshells/report/${ nutshellUid }` )

	// Mute nutshell
	async function mute() {

		setMuting( true )
		await Promise.all( [ app.markNutshellRead( nutshellUid ), app.muteNutshell( nutshellUid ) ] ).catch( catcher )
		setMuting( false )
		hideSelf( true )

	}

	// Delete nutshell
	async function deleteNutshell() {

		setDeleting( true )
		await app.deleteNutshell( nutshellUid ).catch( catcher )
		setDeleting( false )
		hideSelf( true )

	}
	

	return <TouchableOpacity testID='menudots' onPress={ f => setOpen( true ) } style={ { ...style } }>
		<Menu onDismiss={ f => setOpen( false ) } visible={ isOpen } anchor={ <IconButton style={ { opacity: .5, width: 50, height: 50, zIndex: 2 } } onPress={ f => setOpen( true ) } icon="dots-vertical" /> }>
			{ !isSelf && <Menu.Item onPress={ report } title="Report abuse" /> }
			{ !isSelf && <Menu.Item onPress={ block }  title={ blocking ? 'Blocking user...' : "Block & unfollow this user" } /> }
			{ !isSelf && <Menu.Item onPress={ mute }   title={ muting ? 'Muting user...' : "Mute this Nutshell" } /> }
			{ ( isSelf || isAdmin ) && <Menu.Item onPress={ deleteNutshell }  title={ deleting ? 'Deleting nutshell...' : "Delete this Nutshell" } /> }
		</Menu>
	</TouchableOpacity>
}
