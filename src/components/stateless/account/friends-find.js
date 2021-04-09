import React, { memo, useState } from 'react'
import { useSelector } from 'react-redux'
import { Card, Text, Link, View, UserAvatar, Button, Profiler, ActivityIndicator } from '../common/generic'
import { log } from '../../../modules/helpers'
import app from '../../../modules/firebase/app'


const UnoptimisedListResults = ( { results=[], recommendedProfiles=[], filter='all', loading } ) => {

	const [ ignored, setIgnored ] = useState( [] )
	const ignoreRecommendation = uid => {
		setIgnored( [ ...ignored, uid ] )
		app.ignoreRecommendation( uid )
	}

	// Parse ignored results
	recommendedProfiles = recommendedProfiles.filter( ( { uid } ) => !ignored.includes( uid ) )

	return <View style={ { width: '100%', paddingTop: 20 } }>
	
		{ !loading && results.length == 0 && <Text style={ { textAlign: 'center' } }>No users found, try a different query</Text> }



		{ /* Recommendartions */ }
		{ [ 'all' ].includes( filter ) && ( loading || recommendedProfiles.length > 0 ) && <Text style={ { fontSize: 18, paddingTop: 20, paddingBottom: 10 } }>Recommendations:</Text> }
		{ loading && [ 0, 1, 2, 3 ].map( i => <Card key={ `recc-placeholder-${ i }` }>
				<ActivityIndicator />
		</Card> ) }
		{ [ 'all' ].includes( filter ) && recommendedProfiles.length > 0 && recommendedProfiles.map( user => <UserResultCard
			key={ `recc-${ user.uid }` }
			user={ user }
			ignoreRecommendation={ ignoreRecommendation }
		/> ) }

		

		{ /* Seaech results */ }
		{ [ 'all' ].includes( filter ) && ( loading || results.length > 0 ) && <Text style={ { fontSize: 18, paddingTop: 20, paddingBottom: 10 } }>Interesting people:</Text> }
		{ loading && [ 0, 1, 2, 3 ].map( i => <Card key={ `search-placeholder-${ i }` }>
				<ActivityIndicator />
		</Card> ) }
		{ [ 'all', 'search', 'friends' ].includes( filter ) && results.length > 0 && results.map( ( user, i ) => <UserResultCard
			i={ i }
			key={ `search-${ user.uid }` }
			user={ user }
		/> ) }

	</View>
}

export const ListResults = memo( UnoptimisedListResults, ( prev, next ) => {

	// If array lengths do not match, rerender anyway
	if( prev.results?.length != next.results?.length ) return false
	if( prev.recommendedProfiles?.length != next.recommendedProfiles?.length ) return false
	if( prev.filter != next.filter ) return false

	// If loading status changed
	if( prev.loading != next.loading ) return false

	for ( let i = prev.results?.length - 1; i >= 0; i-- ) {
		// There is an element in the new results that is not in the old ones
		if( !next.results?.find( ( { uid } ) => uid == prev.results[i].uid ) ) {
			return false
		}
	}

	for ( let i = prev.recommendedProfiles?.length - 1; i >= 0; i-- ) {
		// There is an element in the new results that is not in the old ones
		if( !next.recommendedProfiles?.find( ( { uid } ) => prev.recommendedProfiles[i].uid ) ) {
			return false
		}
	}

	// No changed? Memo yes
	return true

} )

export const LinkContacts = ( { linkContacts, ...props } ) => <View style={ { width: '100%', paddingTop: 20 } }>
	<Button onPress={ linkContacts }>Improve my recommendations</Button>
</View>

// ///////////////////////////////
// Entry cards
// ///////////////////////////////

const UnoptimisedUserResultCard = ( { i, user, ignoreRecommendation } ) => {

	const [ following, setFollowing ] = useState( user.following )

	const follow = ( uid, unfollowInstead ) => {
		unfollowInstead ? app.unfollowPerson( uid ) : app.followPerson( uid )
		setFollowing( !following )
	}

	return <Card>
		<View style={ { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1 } }>
			<UserAvatar size={ 75 } user={ user } />
			<View nativeID={ typeof i != 'undefined' && `friends-find-search-result-${i}` } style={ { flex: 1, alignSelf: 'stretch', paddingLeft: 20, paddingVertical: 10, flexDirection: 'column', justifyContent: 'space-between' } }>
				<Link nativeID={ typeof i != 'undefined' && `friends-find-search-result-link-${i}` } to={ `/${user.handle}` }>{ user.name }</Link>
				<Text style={ { flex: 1,fontStyle: 'italic', opacity: .8 } }>{ user.bio || `This person has nothing to say about themselves. It's ok to be shy though. ` }</Text>
				<View style={ { flexDirection: 'row' } }>
					{ !following && <Button style={ { width: 100, alignItems: 'flex-start' } } onPress={ f => follow( user.uid ) }>Follow</Button> }
					{ following && <Button mode='outlined' style={ { width: 120 } } onPress={ f => follow( user.uid, true ) }>Unfollow</Button> }
					{ ignoreRecommendation && <Button mode='text' style={ { width: 120 } } onPress={ f => ignoreRecommendation( user.uid ) }>Ignore</Button> }
				</View>
			</View>
		</View>
	</Card>
}

const UserResultCard = memo( UnoptimisedUserResultCard )
