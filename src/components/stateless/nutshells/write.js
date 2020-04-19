import React, { useState } from 'react'

// Visual
import { View } from 'react-native'
import { Card, Main, Title, Input, Button, Subheading, Divider, Toggle, HelperText, Text, UserAvatar, withTheme } from '../common/generic'

// Data
import { weekNumber, nextMonday } from '../../../modules/helpers'

export const Editor = ( { children, avatarSize=100, user={}, status, entries, updateEntry, maxTitleLength, maxParagraphLength, saveDraft, toggleStatus, changesMade } ) => {

	const statusMessage = status == 'draft' ? 'Draft: will not auto-publish' : `Status: scheduled for ${ nextMonday().toString().match( /([a-zA-Z]* )([a-zA-Z]* )(\d* )/ )[0] }`

	return <Main.Center>
		<View style={ { paddingVertical: avatarSize/2 } }>
			<Card style={ { paddingTop: 0, width: 500 } } >

				{ /* Meta overview */ }
				<View style={ { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingVertical: 20 } }>
					<UserAvatar size={ 60 } user={ user } />
					<View style={ { paddingLeft: 10, paddingVertical: 10, alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start' } }>
						<Title style={ { marginVertical: 0 } }>{ user.name ? `${user.name}'s` : `Your` } nutshell for week { weekNumber() }</Title>
						{ status == 'scheduled' && <Text style={ { fontStyle: 'italic' } }></Text> }
						<Toggle onToggle={ toggleStatus } label={ statusMessage } value={ status == 'scheduled' } />
					</View>
				</View>

				<Text style={ { paddingTop: 20 } }>A nutshell consists out of paragraphs. Each paragraph has a one line summary and a longer message under it.</Text>

				{ entries.map( ( { uid, title, paragraph }, i ) => <Entry
						isFirst={ i == 0 }
						key={ uid }
						title={ title }
						paragraph={ paragraph }
						onInput={ ( attr, text ) => updateEntry( uid, attr, text ) }
						maxTitleLength={ maxTitleLength }
						maxParagraphLength={ maxParagraphLength }
					/>
				) }

				{ changesMade && <Button onPress={ saveDraft }>Save changes</Button> }
			</Card>
		</View>
	</Main.Center>
}

export const Entry = ( { title='', paragraph='', onInput, isFirst, maxTitleLength, maxParagraphLength } ) => {

	const [ opaque, setOpaque ] = useState( title.length > 0 || paragraph.length > 0 || isFirst  )

	let hasContent = title.length > 0 || paragraph.length > 0
	const onFocus = f => setOpaque( true )
	const onBlur = f => setOpaque( title.length > 0 || paragraph.length > 0 || isFirst )

	return <View style={ { paddingVertical: 20, opacity: opaque ? 1 : .2 } }>
		<Input
			onFocus={ onFocus }
			onBlur={ onBlur }
			hideInfo={ true }
			style={ { fontWeight: 'bold' } }
			value={ title }
			label='One line summary'
			info={ `A short summary (max ${ maxTitleLength } characters) of what you want to say. E.g. "Struggling to focus this week" or "My new routine is really nice".` }
			onChangeText={ text => onInput( 'title', text ) }
			dense={ false }
		/>
		<Input
			onFocus={ onFocus }
			onBlur={ onBlur }
			hideInfo={ true }
			value={ paragraph }
			label='Elaborate message paragraph'
			info={ `Explain in detail what you want to say (max ${ maxParagraphLength } characters). This paragraph will collapse under the one line summary, people will only see it if they click your one liner.` }
			onChangeText={ text => onInput( 'paragraph', text ) }
			multiline={ true }
		/>
	</View>
}