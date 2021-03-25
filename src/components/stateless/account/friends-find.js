import React, { memo, useState } from 'react'
import { Card, Text, Link, View, UserAvatar, Button, Profiler } from '../common/generic'
import { log } from '../../../modules/helpers'
import app from '../../../modules/firebase/app'


const UnoptimisedListResults = ( { results=[], follow, unfollow, recommendedProfiles=[], filter='all' } ) => {

	const [ ignored, setIgnored ] = useState( [] )
	const ignoreRecommendation = uid => {
		setIgnored( [ ...ignored, uid ] )
		app.ignoreRecommendation( uid )
	}

	// Parse ignored results
	recommendedProfiles = recommendedProfiles.filter( ( { uid } ) => !ignored.includes( uid ) )

	return <View style={ { width: '100%', paddingTop: 20 } }>
	
		{ results.length == 0 && <Text style={ { textAlign: 'center' } }>No users found, try a different query</Text> }


		{ /* Recommendartions */ }
		{ [ 'all' ].includes( filter ) && recommendedProfiles.length > 0 && <Text style={ { fontSize: 18, paddingTop: 20, paddingBottom: 10 } }>Recommendations:</Text> }
		{ [ 'all' ].includes( filter ) && recommendedProfiles.length > 0 && recommendedProfiles.map( user => <Card key={ `recc-${ user.uid }` }>
			<View style={ { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1 } }>
				<UserAvatar size={ 75 } user={ user } />
				<View style={ { flex: 1, alignSelf: 'stretch', paddingLeft: 20, paddingVertical: 10, flexDirection: 'column', justifyContent: 'space-between' } }>
					<Link to={ `/${user.handle}` }>{ user.name }</Link>
					<Text style={ { flex: 1,fontStyle: 'italic', opacity: .8 } }>{ user.bio || `This person has nothing to say about themselves. It's ok to be shy though. ` }</Text>
					<View style={ { flexDirection: 'row' } }>
						{ !user.following && <Button style={ { width: 100, alignItems: 'flex-start' } } onPress={ f => follow( user.uid ) }>Follow</Button> }
						{ user.following && <Button mode='outlined' style={ { width: 120 } } onPress={ f => unfollow( user.uid ) }>Unfollow</Button> }
						{ <Button mode='text' style={ { width: 120 } } onPress={ f => ignoreRecommendation( user.uid ) }>Ignore</Button> }
					</View>
				</View>
			</View>
		</Card>) }

		

		{ /* Seaech results */ }
		{ [ 'all' ].includes( filter ) && <Text style={ { fontSize: 18, paddingTop: 20, paddingBottom: 10 } }>Interesting people:</Text> }
		{ [ 'all', 'search', 'friends' ].includes( filter ) && results.length > 0 && results.map( ( user, i ) => <Card key={ `search-${ user.uid }` }>
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
}

export const ListResults = memo( UnoptimisedListResults, ( prev, next ) => {

	// If array lengths do not match, rerender anyway
	if( prev.results.length != next.results.length ) return false
	if( prev.recommendedProfiles.length != next.recommendedProfiles.length ) return false
	if( prev.filter != next.filter ) return false

	for ( let i = prev.results.length - 1; i >= 0; i-- ) {
		// There is a mismatch
		if( !next.results.find( ( { uid } ) => uid == prev.results[i].uid ) ) {
			return false
		}
	}

	for ( let i = prev.recommendedProfiles.length - 1; i >= 0; i-- ) {
		// There is a mismatch
		if( !next.recommendedProfiles.find( ( { uid } ) => prev.recommendedProfiles[i].uid ) ) {
			return false
		}
	}

	// No changed? Memo yes
	return true

} )

export const LinkContacts = ( { linkContacts, ...props } ) => <View style={ { width: '100%', paddingTop: 20 } }>
	<Button onPress={ linkContacts }>Improve my recommendations</Button>
</View>