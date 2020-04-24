import React, { useState } from 'react'

// Visual
import { TouchableOpacity } from 'react-native'
import { Card, Main, Title, Input, Button, Subheading, Divider, Toggle, HelperText, Text, UserAvatar, View, ToolTip, Caption, IconButton } from '../common/generic'

// Data
import { weekNumber, nextMonday } from '../../../modules/helpers'

export const Editor = ( { children, avatarSize=100, user={}, status, entries, updateEntry, maxTitleLength, maxParagraphLength, saveDraft, toggleStatus, changesMade, background='grey', inspire } ) => {

	const statusMessage = status == 'draft' ? 'Draft: will not auto-publish' : `Status: scheduled for ${ nextMonday().toString().match( /([a-zA-Z]* )([a-zA-Z]* )(\d* )/ )[0] }`

	return <View>
		<View style={ { paddingVertical: avatarSize/2, width: '100%' } }>
			<Card style={ { paddingTop: 0, width: 500 } } >

				{ /* Meta overview */ }
				<View style={ { width: '100%', flexDirection: 'column', flexWrap: 'wrap', justifyContent: 'flex-start', alignItems: 'center' } }>
					<UserAvatar style={ { marginTop: -avatarSize/2 } } size={ avatarSize } user={ user } />
					<View style={ { flex: 1, paddingVertical: 10, alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start' } }>
						
						<Title style={ { marginVertical: 0, paddingVertical: 20, textAlign: 'center', width: '100%' } }>{ user.name ? `${user.name}'s` : `Your` } nutshell for week { weekNumber() }</Title>
						<Toggle style={ { padding: 10, backgroundColor: background } } onToggle={ toggleStatus } label={ statusMessage } value={ status == 'scheduled' } />
						<ToolTip label='What is a nutshell?' info={
							`A nutshell is a summary of what/how you are doing.
							\nNutshells are published on mondays. You only get one nutshell per week.
						` } />
					</View>
				</View>

				{ changesMade && <Button onPress={ saveDraft }>Save changes</Button> }
			</Card>


			{ entries.map( ( { uid, title, paragraph }, i ) => <Entry
					isFirst={ i == 0 }
					key={ uid }
					title={ title }
					paragraph={ paragraph }
					onInput={ ( attr, text ) => updateEntry( uid, attr, text ) }
					maxTitleLength={ maxTitleLength }
					maxParagraphLength={ maxParagraphLength }
					inspire={ inspire }
				/>
			) }

		</View>
	</View>
}

export const Entry = ( { title='', paragraph='', onInput, isFirst, maxTitleLength, maxParagraphLength, inspire } ) => {

	const [ opaque, setOpaque ] = useState( title.length > 0 || paragraph.length > 0 || isFirst  )
	const [ inspiration, setInspiration ] = useState( inspire() )
	const newInspiration = f => {
		let newOne = inspire()
		if( inspiration == newOne ) newOne = inspire()
		setInspiration( newOne )
	}

	let hasContent = title.length > 0 || paragraph.length > 0
	const onFocus = f => setOpaque( true )
	const onBlur = f => setOpaque( title.length > 0 || paragraph.length > 0 || isFirst )

	return <Card style={ { paddingVertical: 20, opacity: opaque ? 1 : .5 } }>
		<Input
			onFocus={ onFocus }
			onBlur={ onBlur }
			hideInfo={ true }
			style={ { fontWeight: 'bold' } }
			value={ title }
			label='Headline'
			info={ `A short summary (max ${ maxTitleLength } characters) of what you want to say. E.g. "Struggling to focus this week" or "My new routine is really nice".` }
			onChangeText={ text => onInput( 'title', text ) }
			dense={ false }
		/>
		<Input
			onFocus={ onFocus }
			onBlur={ onBlur }
			hideInfo={ true }
			value={ paragraph }
			label='Message'
			info={ `Explain in detail what you want to say (max ${ maxParagraphLength } characters). This paragraph will collapse under the one line summary, people will only see it if they click your one liner.` }
			onChangeText={ text => onInput( 'paragraph', text ) }
			multiline={ true }
		/>
		<TouchableOpacity style={ { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 10 } } onPress={ newInspiration }>
			<Caption>Inspiration: { inspiration }</Caption>
			<IconButton style={ { opacity: .8 } } size={ 15 } icon='reload' />
		</TouchableOpacity>
	</Card>
}