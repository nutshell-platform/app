import React from 'react'
import { Card, Text, Link, View, UserAvatar, Button } from '../common/generic'

export const ListResults = ( { results=[], follow, unfollow, recommendedProfiles=[], filter='all' } ) => <View style={ { width: '100%', paddingTop: 20 } }>
	{ results.length == 0 && <Text style={ { textAlign: 'center' } }>No users found, try a different query</Text> }

	{ /* Recommendartions */ }
	{ [ 'all' ].includes( filter ) && recommendedProfiles.length > 0 && <Text style={ { fontSize: 18, paddingTop: 20, paddingBottom: 10 } }>Recommendations:</Text> }
	{ [ 'all' ].includes( filter ) && recommendedProfiles.length > 0 && recommendedProfiles.map( user => <Card key={ user.uid }>
		<View style={ { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1 } }>
			<UserAvatar size={ 75 } user={ user } />
			<View style={ { flex: 1, alignSelf: 'stretch', paddingLeft: 20, paddingVertical: 10, flexDirection: 'column', justifyContent: 'space-between' } }>
				<Link to={ `/${user.handle}` }>{ user.name }</Link>
				<Text style={ { flex: 1,fontStyle: 'italic', opacity: .8 } }>{ user.bio || `This person has nothing to say about themselves. It's ok to be shy though. ` }</Text>
				{ !user.following && <Button style={ { width: 100, alignItems: 'flex-start' } } onPress={ f => follow( user.uid ) }>Follow</Button> }
				{ user.following && <Button mode='outlined' style={ { width: 120 } } onPress={ f => unfollow( user.uid ) }>Unfollow</Button> }
			</View>
		</View>
	</Card>) }

	{ /* Seaech results */ }
	{ [ 'all' ].includes( filter ) && <Text style={ { fontSize: 18, paddingTop: 20, paddingBottom: 10 } }>Interesting people:</Text> }
	{ [ 'all', 'search', 'friends' ].includes( filter ) && results.length > 0 && results.map( ( user, i ) => <Card key={ user.uid }>
		<View nativeID={ `friends-find-search-result-${i}` } style={ { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1 } }>
			<UserAvatar size={ 75 } user={ user } />
			<View style={ { flex: 1, alignSelf: 'stretch', paddingLeft: 20, paddingVertical: 10, flexDirection: 'column', justifyContent: 'space-between' } }>
				<Link nativeID={ `friends-find-search-result-link-${i}` } to={ `/${user.handle}` }>{ user.name }</Link>
				<Text style={ { flex: 1,fontStyle: 'italic', opacity: .8 } }>{ user.bio || `This person has nothing to say about themselves. It's ok to be shy though. ` }</Text>
				{ !user.following && <Button style={ { width: 100, alignItems: 'flex-start' } } onPress={ f => follow( user.uid ) }>Follow</Button> }
				{ user.following && <Button mode='outlined' style={ { width: 120 } } onPress={ f => unfollow( user.uid ) }>Unfollow</Button> }
			</View>
		</View>
	</Card> ) }

</View>

export const LinkContacts = ( { linkContacts, ...props } ) => <View style={ { width: '100%', paddingTop: 20 } }>
	<Button onPress={ linkContacts }>Improve my recommendations</Button>
</View>