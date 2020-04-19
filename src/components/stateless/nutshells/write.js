import React from 'react'

// Visual
import { View } from 'react-native'
import { Card, Main, Title, Input, Button, Subheading, Divider, Toggle, HelperText, Text, UserAvatar, withTheme } from '../common/generic'

// Data
import { weekNumber, nextMonday } from '../../../modules/helpers'

export const Editor = ( { children, avatarSize=100, user={}, scheduled, entries, updateEntry } ) => {

	return <Main.Center>
		<View style={ { paddingVertical: avatarSize/2 } }>
			<Card style={ { paddingTop: 0, width: 500 } } >

				{ /* Meta overview */ }
				<View style={ { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingVertical: 20 } }>
					<UserAvatar size={ 60 } user={ user } />
					<View style={ { paddingLeft: 10, paddingVertical: 10, alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start' } }>
						<Title style={ { marginVertical: 0 } }>{ user.name ? `${user.name}'s` : `Your` } nutshell for week { weekNumber() }</Title>
						{ scheduled && <Text style={ { fontStyle: 'italic' } }>Status: scheduled for { nextMonday().toString().match( /([a-zA-Z]* )([a-zA-Z]* )(\d* )/ )[0] }</Text> }
						{ !scheduled && <Text style={ { fontStyle: 'italic' } }>Status: draft</Text> }
					</View>
				</View>

				<Text style={ { paddingTop: 20 } }>A nutshell consists out of paragraphs. Each paragraph has a one line summary and an unlimited size message under it.</Text>

				{ entries.map( ( { uuid, title, paragraph }, i ) => <Entry isFirst={ i == 0 } key={ uuid } title={ title } paragraph={ paragraph } onInput={ ( attr, text ) => updateEntry( uuid, attr, text ) } /> ) }

				<Button onPress={ f => alert( 'todo' ) }>{ true ? 'Schedule nutshell' : 'Save draft' }</Button>
			</Card>
		</View>
	</Main.Center>
}

export const Entry = ( { title='', paragraph='', onInput, isFirst } ) => {

	const hasContent = title.length > 0 || paragraph.length > 0

	return <View style={ { paddingVertical: 20, opacity: ( hasContent || isFirst ) ? 1 : .2 } }>
		<Input
			style={ { fontWeight: 'bold' } }
			value={ title }
			label='One line summary'
			info='A short summary of what you want to say. E.g. "Struggling to focus this week" or "My new routine is really nice".'
			onChangeText={ text => onInput( 'title', text ) }
			dense={ false }
		/>
		<Input
			value={ paragraph }
			label='Elaborate message paragraph'
			info='Explain in as much (or little) detail what you want to say. This paragraph will collapse under the one line summary, people will only see it if they click your one liner.'
			onChangeText={ text => onInput( 'paragraph', text ) }
			multiline={ true }
		/>
	</View>
}