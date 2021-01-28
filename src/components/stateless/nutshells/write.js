import React from 'react'

// Visual
import { Card, Title, Toggle, UserAvatar, View, ToolTip, Profiler } from '../common/generic'
import { OptimizedTextEntry } from './_write_text_entry.js'
import { AudioEntry } from './_write_audio_entry.js'

// Data
import { weekNumber, dateOfNext, timestampToHuman } from '../../../modules/helpers'

// ///////////////////////////////
// Editor
// ///////////////////////////////
export const Editor = ( { children, avatarSize=100, user={}, status, entries, updateEntry, maxTitleLength, maxParagraphLength, saveDraft, toggleStatus, unsavedChanges, background='grey', inspire, moveCard } ) => {

	const statusMessage = status == 'draft' ? 'Draft: will not auto-publish' : `Status: scheduled for ${ timestampToHuman( dateOfNext( 'sunday' ) ) } at midnight`

	return <View>
		<View style={ { paddingVertical: avatarSize/2, width: '100%' } }>

		<Card style={ { paddingVertical: 0, width: 500 } } >

			{ /* Meta overview */ }
			<View style={ { width: '100%', flexDirection: 'column', flexWrap: 'wrap', justifyContent: 'flex-start', alignItems: 'center' } }>
				<UserAvatar style={ { marginTop: -avatarSize/2 } } size={ avatarSize } user={ user } />
				<View style={ { flex: 1, paddingVertical: 0, alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' } }>

					<Title style={ { marginVertical: 0, paddingVertical: 20, textAlign: 'center', width: '100%' } }>{ user.name ? `${user.name}'s` : `Your` } Nutshell for week { weekNumber() }</Title>
					<Toggle nativeID='nutshell-write-toggle-scheduled' style={ { padding: 10, backgroundColor: background } } onToggle={ toggleStatus } label={ statusMessage } value={ status == 'scheduled' } />
					<ToolTip label='What is a Nutshell?' info={
						`A Nutshell is a summary of what's been going on in your life since your last Nutshell, such as what you've been doing or how you've been feeling.\n\n Scheduled Nutshells will be published on Mondays, and all users only get one Nutshell per week.
					` } />
				</View>
			</View>

		</Card>

		<AudioEntry />

		{ entries.map( ( { uid, title, paragraph }, i ) => <OptimizedTextEntry
				entrynr={ i }
				entries={ entries.length }
				key={ uid }
				uid={ uid }
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

		</View>
	</View>
}
