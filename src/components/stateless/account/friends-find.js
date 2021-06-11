import React, { memo, useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Card, Text, Link, View, UserAvatar, Button, Profiler, ActivityIndicator } from '../common/generic'
import { log } from '../../../modules/helpers'
import app from '../../../modules/firebase/app'


const UnoptimisedListResults = ( { results=[], recommendedProfiles=[], filter='all', loading } ) => {

	// Load follow requests
	const unconfirmedFollowers = useSelector( store => store?.user?.unconfirmedFollowers || [] )
	const [ requestedFollows, setRequestedFollows ] = useState( unconfirmedFollowers )
	useEffect( f => {

		Promise.all( unconfirmedFollowers.map( uid => app.getPerson( uid, 'uid' ) ) )
		.then( users => {
			log( 'Loaded requested followers: ', users, ' based on ', unconfirmedFollowers )
			setRequestedFollows( users )
		} )

	}, [ unconfirmedFollowers.length ] )

	// Internal state management
	const [ ignored, setIgnored ] = useState( [] )
	const blocked = useSelector( store => store.user?.blocked || [] )
	const following = useSelector( store => store.user?.following || [] )
	const ignoreRecommendation = uid => {
		setIgnored( [ ...ignored, uid ] )
		app.ignoreRecommendation( uid )
	}

	const ignoreRequest = uid => {
		setIgnored( [ ...ignored, uid ] )
		app.ignoreRequest( uid )
	}

	// Sanitisation
	const filter_ignores_blocks_nameless = ( { uid, name} ) => {
		if( !name || !uid ) return false
		if( ignored.includes( uid ) ) return false
		if( blocked.includes( uid ) ) return false
		return true
	}
	// Filter out friends, unless filter == 'friends'
	const filter_friends = ( { uid, name } ) => {
		if( filter == 'friends' || filter == 'search' ) return true
		return !following.includes( uid )
	}

	// Set sane results to state
	const [ saneResults, setSaneResults ] = useState( results.filter( filter_ignores_blocks_nameless ).filter( filter_friends ) )
	const [ saneReccs, setSaneReccs ] = useState( recommendedProfiles.filter( filter_friends ).filter( filter_ignores_blocks_nameless ) )
	const [ saneRequests, setSaneRequests ] = useState( requestedFollows.filter( filter_ignores_blocks_nameless ) )


	useEffect( f => {

		log( 'Updating friend interface' )

		// Update internal state
		setSaneResults( results.filter( filter_ignores_blocks_nameless ).filter( filter_friends ) )
		setSaneReccs( recommendedProfiles.filter( filter_friends ).filter( filter_ignores_blocks_nameless ) )
		setSaneRequests( requestedFollows.filter( filter_ignores_blocks_nameless ) )

	}, [ results.length, recommendedProfiles.length, requestedFollows, ignored.length, blocked.length, following.length ] )


	return <View style={ { width: '100%', paddingTop: 20 } }>
	
		{ !loading && saneResults.length == 0 && <Text style={ { textAlign: 'center' } }>No users found, try a different query</Text> }

		{ /* Follow requests */ }
		{ [ 'all' ].includes( filter ) && ( loading || saneRequests.length > 0 ) && <Text style={ { fontSize: 18, paddingTop: 20, paddingBottom: 10 } }>Follow requests:</Text> }
		{ loading && [ 0, 1, 2, 3 ].map( i => <Card key={ `req-placeholder-${ i }` }>
				<ActivityIndicator />
		</Card> ) }
		{ [ 'all' ].includes( filter ) && saneRequests.length > 0 && saneRequests.map( user => <UserResultCard
			key={ `req-${ user.uid }` }
			user={ user }
			isRequest={ true }
			ignoreUser={ ignoreRequest }
		/> ) }

		{ /* Recommendartions */ }
		{ [ 'all' ].includes( filter ) && ( loading || saneReccs.length > 0 ) && <Text style={ { fontSize: 18, paddingTop: 20, paddingBottom: 10 } }>Recommendations:</Text> }
		{ loading && [ 0, 1, 2, 3 ].map( i => <Card key={ `recc-placeholder-${ i }` }>
				<ActivityIndicator />
		</Card> ) }
		{ [ 'all' ].includes( filter ) && saneReccs.length > 0 && saneReccs.map( user => <UserResultCard
			key={ `recc-${ user.uid }` }
			user={ user }
			ignoreUser={ ignoreRequest }
		/> ) }

		

		{ /* Seaech results */ }
		{ [ 'all' ].includes( filter ) && ( loading || saneResults.length > 0 ) && <Text style={ { fontSize: 18, paddingTop: 20, paddingBottom: 10 } }>Interesting people:</Text> }
		{ loading && [ 0, 1, 2, 3 ].map( i => <Card key={ `search-placeholder-${ i }` }>
				<ActivityIndicator />
		</Card> ) }
		{ [ 'all', 'search', 'friends' ].includes( filter ) && saneResults.length > 0 && saneResults.map( ( user, i ) => <UserResultCard
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

const UnoptimisedUserResultCard = ( { i, user, ignoreUser, isRequest=false } ) => {

	const alreadyFollowing = useSelector( store => store?.user?.following || [] )
	const [ following, setFollowing ] = useState( !!alreadyFollowing.find( uid => user.uid == uid ) )

	// In case of private account
	const alreadyRequested = useSelector( store => store?.user?.requestedFollows || [] )
	const [ requested, setRequested ] = useState( !!alreadyRequested.find( uid => user.uid == uid ) )

	const follow = ( uid, unfollowInstead ) => {
		if( unfollowInstead ) {
			app.unfollowPerson( uid )
			setFollowing( false )
			setRequested( false )
		}
		if( !unfollowInstead ) {
			app.followPerson( uid )
			user.privateProfile ? setRequested( true ) : setFollowing( true )
		}
	}

	const allowFollow = uid => {
		app.acceptFollower( uid )
		setFollowing( true )
	}

	// update follow status when redux updates
	useEffect( f => {
		const currentlyFollowing = !!alreadyFollowing.find( uid => user.uid == uid )
		if( following != currentlyFollowing ) setFollowing( currentlyFollowing )

		const currentlyRequested = !!alreadyRequested.find( uid => user.uid == uid )
		if( requested != currentlyRequested ) setRequested( currentlyRequested )
	}, [ alreadyFollowing.length, alreadyRequested.length ] )


	// If is an accepted request, render null
	return ( isRequest && following ) ? null : <Card>
		<View style={ { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1 } }>
			<UserAvatar size={ 75 } user={ user } />
			<View nativeID={ typeof i != 'undefined' ? `friends-find-search-result-${i}` : `friends-recc-${ user?.uid }` } style={ { flex: 1, alignSelf: 'stretch', paddingLeft: 20, paddingVertical: 10, flexDirection: 'column', justifyContent: 'space-between' } }>
				<Link nativeID={ typeof i != 'undefined' ? `friends-find-search-result-link-${i}` : `friends-recc-link-${ user?.uid }` } to={ `/${user.handle}` }>{ user.name }</Link>
				<Text style={ { flex: 1,fontStyle: 'italic', opacity: .8 } }>{ user.bio || `This person has nothing to say about themselves. It's ok to be shy though. ` }</Text>
				<View style={ { flexDirection: 'row' } }>

					{  /* Not yet following */ }
					{ !following && !requested && <Button
						nativeID={ typeof i != 'undefined' ? `friends-find-search-result-follow-${i}` : `friends-recc-follow-${ user?.uid }` }
						style={ { alignItems: 'flex-start' } }
						onPress={ f => isRequest ? allowFollow( user.uid ) : follow( user.uid ) }>

						{ isRequest && 'Accept' }
						{ !isRequest && ( user.privateProfile ? 'Request follow' : 'Follow' ) }

					</Button> }

					{ requested && <Button
						nativeID={ typeof i != 'undefined' ? `friends-find-search-result-follow-${i}` : `friends-recc-follow-${ user?.uid }` }
						style={ { alignItems: 'flex-start' } }
						onPress={ f => follow( user.uid, true ) }>Cancel follow request</Button> }

					{ following && !isRequest && <Button
						mode='outlined'
						style={ { width: 120 } }
						onPress={ f => follow( user.uid, true ) }>
						Unfollow
					</Button> }

					{ ignoreUser && <Button mode='text' style={ { width: 120 } } onPress={ f => ignoreUser( user.uid ) }>Ignore</Button> }
				</View>
			</View>
		</View>
	</Card>
}

const UserResultCard = memo( UnoptimisedUserResultCard )
