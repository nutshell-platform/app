import React from 'react'
import { Card, Text, View, UserAvatar, Button } from '../common/generic'

export const ListResults = ( { results=[], follow } ) => <View style={ { width: '100%', paddingTop: 20 } }>
	{ results.map( user => <Card key={ user.uid }>
		<View style={ { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1 } }>
			<UserAvatar size={ 75 } user={ user } />
			<View style={ { flex: 1, alignSelf: 'stretch', paddingLeft: 20, paddingVertical: 10, flexDirection: 'column', justifyContent: 'space-between' } }>
				<Text>{ user.name }</Text>
				<Text style={ { flex: 1,fontStyle: 'italic', opacity: .8 } }>{ user.bio || `This person has nothing to say about themselves. It's ok to be sky though. ` }</Text>
				<Button style={ { width: 100, alignItems: 'flex-start' } } onPress={ f => follow( user.uid ) }>+ Follow</Button>
			</View>
		</View>
	</Card> ) }
</View>

export const another = true