import React, { useState } from 'react'

// Visual
import { TouchableOpacity } from 'react-native'
import { Card, Main, Title, Input, Subheading, Divider, Toggle, HelperText, Text, UserAvatar, View, ToolTip, Caption, IconButton, Profiler } from '../common/generic'

// Data
import { weekNumber, dateOfNext, timestampToHuman, timestampToTime } from '../../../modules/helpers'

export const Editor = ( { children, avatarSize=100, user={}, status, entries, updateEntry, maxTitleLength, maxParagraphLength, saveDraft, toggleStatus, unsavedChanges, background='grey', inspire, moveCard } ) => {

	const statusMessage = status == 'draft' ? 'Draft: will not auto-publish' : `Status: scheduled for ${ timestampToHuman( dateOfNext( 'sunday' ) ) } at midnight`

	return <View>
		<View style={ { paddingVertical: avatarSize/2, width: '100%' } }>

		<Profiler id='editor-header'>
			<Card style={ { paddingTop: 0, width: 500 } } >

				{ /* Meta overview */ }
				<View style={ { width: '100%', flexDirection: 'column', flexWrap: 'wrap', justifyContent: 'flex-start', alignItems: 'center' } }>
					<UserAvatar style={ { marginTop: -avatarSize/2 } } size={ avatarSize } user={ user } />
					<View style={ { flex: 1, paddingVertical: 10, alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' } }>

						<Title style={ { marginVertical: 0, paddingVertical: 20, textAlign: 'center', width: '100%' } }>{ user.name ? `${user.name}'s` : `Your` } Nutshell for week { weekNumber() }</Title>
						<Toggle nativeID='nutshell-write-toggle-scheduled' style={ { padding: 10, backgroundColor: background } } onToggle={ toggleStatus } label={ statusMessage } value={ status == 'scheduled' } />
						<ToolTip label='What is a Nutshell?' info={
							`A Nutshell is a summary of what's been going on in your life since your last Nutshell, such as what you've been doing or how you've been feeling.\n\n Scheduled Nutshells will be published on Mondays, and all users only get one Nutshell per week.
						` } />
					</View>
				</View>

			</Card>
		</Profiler>

		<Profiler id='editor-entries'>
			{ entries.map( ( { uid, title, paragraph }, i ) => <Entry
					entrynr={ i }
					entries={ entries.length }
					key={ uid }
					title={ title }
					paragraph={ paragraph }
					onInput={ ( attr, text ) => updateEntry( uid, attr, text ) }
					maxTitleLength={ maxTitleLength }
					maxParagraphLength={ maxParagraphLength }
					inspire={ inspire }
					unsavedChanges={ unsavedChanges }
					move={ moveCard }
				/>
			) }
		</Profiler>

		</View>
	</View>
}

const UnoptimisedEntry = ( { title='', paragraph='', onInput, entrynr, entries, maxTitleLength, maxParagraphLength, inspire, unsavedChanges, move } ) => {

	const [ opaque, setOpaque ] = useState( title.length > 0 || paragraph.length > 0 || ( entrynr == 0 )  )
	const [ inspiration, setInspiration ] = useState( inspire() )
	const newInspiration = f => {
		let newOne = inspire()
		if( inspiration == newOne ) newOne = inspire()
		setInspiration( newOne )
	}

	// Internal state management
	const updateTitle = text =>  onInput( 'title', text )
	const updateParagraph = text => onInput( 'paragraph', text )

	const onFocus = f => setOpaque( true )
	const onBlur = f => setOpaque( title.length > 0 || paragraph.length > 0 || ( entrynr == 0 ) )

	return <Profiler id={ `nutshell-${ entrynr }-card` }>
		<Card nativeID={ `nutshell-write-entry-${ entrynr }` } style={ { paddingVertical: 20, opacity: opaque ? 1 : .5 } }>


			<Profiler id={ `nutshell-${ entrynr }-head` }>
				
				{ entrynr < ( entries - 1 ) && <View style={ { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' } }>
					<IconButton nativeID={ `nutshell-write-entry-${ entrynr }-moveup` } onPress={ f => move( entrynr, 'up' ) } size={ 15 } style={ { opacity: .8 } } icon='arrow-up' />
					<Caption>Entry { entrynr + 1 } of { entries - 1 } (max 10)</Caption>
					<IconButton nativeID={ `nutshell-write-entry-${ entrynr }-movedown` }  onPress={ f => move( entrynr, 'down' ) } size={ 15 } style={ { opacity: .8 } } icon='arrow-down' />
				</View> }

			</Profiler>


			<Profiler id={ `nutshell-${ entrynr }-input-header` }>
				<Input
					nativeID={ `nutshell-write-entry-${ entrynr }-headline` }
					onFocus={ onFocus }
					onBlur={ onBlur }
					hideInfo={ true }
					style={ { fontWeight: 'bold' } }
					value={ title }
					label={ `Headline (${ title.length }/${ maxTitleLength })` }
					info={ `A short summary of at most ${ maxTitleLength } characters about what you want to say.\n
					Examples: "Struggling to focus this week" or "My new routine is really nice".` }
					onChangeText={ updateTitle }
					dense={ false }
				/>
			</Profiler>

			<Profiler id={ `nutshell-${ entrynr }-input-paragraph` }>
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
			</Profiler>

			<Profiler id={ `nutshell-${ entrynr }-inspiration` }>

				<TouchableOpacity style={ { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 10 } } onPress={ newInspiration }>
					<Caption>Inspiration: { inspiration }</Caption>
					<IconButton style={ { opacity: .8 } } size={ 15 } icon='reload' />
				</TouchableOpacity>

			</Profiler>

			<Profiler id={ `nutshell-${ entrynr }-lastsaved` }>
				<HelperText style={ {  textAlign: 'center', width: '100%' } }>{ unsavedChanges ? 'Unsaved changes. ' : `All changes saved at ${timestampToTime()}. ` }</HelperText>
			</Profiler>

		</Card>
	</Profiler>
}

export const Entry = React.memo( UnoptimisedEntry, ( prev, next ) => {

	if( prev.title != next.title ) return false
	if( prev.paragraph != next.paragraph ) return false
	if( prev.entrynr != next.entrynr ) return false
	if( prev.entries != next.entries ) return false
	if( prev.unsavedChanges != next.unsavedChanges ) return false

	// No changed? Memo yes
	return true

} )