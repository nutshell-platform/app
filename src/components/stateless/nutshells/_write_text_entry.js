import React, { useState } from 'react'
import { useSelector } from 'react-redux'

// Visual
import { Pressable } from 'react-native'
import { Card, Input, HelperText, View, Caption, IconButton, Menu } from '../common/generic'

// Data
import { timestampToTime } from '../../../modules/helpers'


// ///////////////////////////////
// Single entry card
// ///////////////////////////////
export const UnoptimisedTextEntry = ( { uid, title='', paragraph='', onInput, entrynr, entries, maxTitleLength, maxParagraphLength, inspire, unsavedChanges, move } ) => {

	// Styling
	const verticalPadding = 20
	const horizontalPadding = 10
	const theme = useSelector( store => store.settings?.theme || {} )

	// opacity ( for unused nutshell ) handler
	const [ opaque, setOpaque ] = useState( title.length > 0 || paragraph.length > 0 || ( entrynr == 0 )  )

	// Menu handlers
	const [ isOpen, setOpen ] = useState( false )
	const menuMove = direction => {
		move( entrynr, direction )
		setOpen( false )
	}

	// Inspiration handler
	const [ inspiration, setInspiration ] = useState( inspire() )
	const newInspiration = f => {
		let newOne = inspire()
		if( inspiration == newOne ) newOne = inspire()
		setInspiration( newOne )
	}

	// Saved status
	const savingIndicator = ( unsavedChanges == uid ) ? { borderBottomWidth: 3, borderBottomColor: theme.colors?.error } : {}

	// Internal state management
	const updateTitle = text =>  onInput( 'title', text )
	const updateParagraph = text => onInput( 'paragraph', text )

	const onFocus = f => setOpaque( true )
	const onBlur = f => setOpaque( title.length > 0 || paragraph.length > 0 || ( entrynr == 0 ) )

	return <Card nativeID={ `nutshell-write-entry-${ entrynr }` } style={ { ...savingIndicator, paddingVertical: verticalPadding, paddingHorizontal: horizontalPadding, opacity: opaque ? 1 : .5 } }>

			{ /* Move nutshell menu */ }
			<Pressable testID='menudots' style={ { position: 'absolute', right: -horizontalPadding, top: -verticalPadding, zIndex: 99 } } onPress={ f => setOpen( true ) }>
				<Menu onDismiss={ f => setOpen( false ) } visible={ isOpen } anchor={ <IconButton style={ { opacity: .5, width: 50, height: 50, zIndex: 2 } } onPress={ f => setOpen( true ) } icon="dots-vertical" /> }>
					<Menu.Item onPress={ f => menuMove( entrynr, 'up' ) } title="Move entry up" />
					<Menu.Item onPress={ f => menuMove( entrynr, 'down' ) } title="Move entry down" />
				</Menu>
			</Pressable>

			<Input
				nativeID={ `nutshell-write-entry-${ entrynr }-headline` }
				onFocus={ onFocus }
				onBlur={ onBlur }
				hideInfo={ true }
				style={ { fontWeight: 'bold' } }
				value={ title }
				label={ `Headline (${ title.length }/${ maxTitleLength })` }
				info={ undefined }
				onChangeText={ updateTitle }
				dense={ false }
			/>

			<Input
				nativeID={ `nutshell-write-entry-${ entrynr }-content` }
				onFocus={ onFocus }
				onBlur={ onBlur }
				hideInfo={ true }
				value={ paragraph }
				label={ `Message (${ paragraph.length }/${ maxParagraphLength })` }
				info={ `Tell the headline's story in at most ${ maxParagraphLength } characters.\n
				In the Nutshell feed, this paragraph will collapse under the headline. Better make sure your headline is catchy!` }
				onChangeText={ updateParagraph }
				multiline={ true }
			/>


			<Pressable style={ { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 10 } } onPress={ newInspiration }>
				<Caption>Inspiration: { inspiration }</Caption>
				<IconButton style={ { opacity: .8 } } size={ 15 } icon='reload' />
			</Pressable>


			{ ( unsavedChanges == uid ) && <HelperText style={ {  textAlign: 'center', width: '100%' } }>{ unsavedChanges ? 'Unsaved changes. ' : `All changes saved at ${timestampToTime()}. ` }</HelperText> }

		</Card>
}

export const OptimizedTextEntry = React.memo( UnoptimisedTextEntry, ( prev, next ) => {

	if( prev.title != next.title ) return false
	if( prev.paragraph != next.paragraph ) return false
	if( prev.entrynr != next.entrynr ) return false
	if( prev.entries != next.entries ) return false
	if( prev.unsavedChanges != next.unsavedChanges ) return false

	// No changed? Memo yes
	return true

} )