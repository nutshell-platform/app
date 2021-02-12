import React, { useState } from 'react'
import { View, IconButton, Button, Menu, Title, Paragraph } from '../common/generic'

// Hooks
import { useSelector } from 'react-redux'
import { useHistory } from '../../../routes/router'
import app from '../../../modules/firebase/app'

// Helper functions
import { catcher } from '../../../modules/helpers'
import { TouchableOpacity } from 'react-native'
import { sendEmail, sendWhatsapp } from '../../../modules/apis/messaging'

// Single collapsble entry
export const Entry = ( { entry } ) => {

	const [ open, setOpen ] = useState( false )

	return <View style={ { width: '100%', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' } }>
		<TouchableOpacity onPress={ f => setOpen( !open ) } style={ { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', width: '100%' } }>
			<Title style={ { flexShrink: 1, fontSize: 18 } }>{ entry.title }</Title>
			<IconButton onPress={ f => setOpen( !open ) } style={ { flexShrink: 1, marginLeft: 'auto' } } size={ 18 } icon={ open ? 'minus' : 'plus' } />
		</TouchableOpacity>

		{ open && <Paragraph style={ { paddingVertical: 20 } }>{ entry.paragraph }</Paragraph> }

	</View>

}

// User contact methods
export const NutshellActions = ( { gutter, archive, contactMethods={} } ) => {

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


// Report users
export const NutshellOptions = ( { nutshell, hideSelf, isSelf, style, ...props } ) => {

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
