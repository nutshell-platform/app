import React, { useState, memo, useEffect, useRef } from 'react'


// Visual
import { NutshellActions, NutshellOptions, Entry } from './_read_text_entry'
import { AudioEntry } from './_read_audio_entry'

// Hooks
import { useSelector } from 'react-redux'
import { useHistory } from '../../../routes/router'
import app from '../../../modules/firebase/app'

// Visual
import { Card, Title, Text, Paragraph, View, HelperText, IconButton, Button, UserAvatar, Appbar, ActivityIndicator, TouchableRipple, Badge } from '../common/generic'
import Tutorial from '../../stateful/onboarding/tutorial'
import { Placeholder, ViewRecs } from '../common/home'



// Helper functions
import { timestampToHuman, weekNumber, log, catcher } from '../../../modules/helpers'
import { TouchableOpacity } from 'react-native'

export const InboxTimeline = memo( ( { renderInbox, ...props } ) => {

	const user = useSelector( store => store?.user || {} )
	const { inbox=[], draft={} } = useSelector( store => store?.nutshells )

	return <React.Fragment>
		<Tutorial />
		{ renderInbox?.length > 0 && renderInbox.map( ( nutshell, index ) => <NutshellCard index={ index } key={ nutshell.uid } nutshell={ nutshell } /> ) }
		<ViewRecs recAmount={ user.recommendations?.length } />
		{ inbox.length == 0 && <Placeholder status={ draft.status } hasDraft={ draft.entries?.length != 0 } /> }
	</React.Fragment>

} )

export const ArchiveTimeline = memo( ( { endReached, ...props } ) => {

	// ///////////////////////////////
	// State management
	// ///////////////////////////////
	const user = useSelector( store => store.user || {} )
	const { archive=[], offline=[] } = useSelector( store => store?.nutshells )
	const getRichNutshells = f => archive.map( nutshellUid => offline.find( ( { uid } ) => nutshellUid == uid ) || { unavailable: nutshellUid } )
	const [ nutshells, setNutshells ] = useState( getRichNutshells() )

	const [ loading, setLoading ] = useState( false )
	const [ visible, setVisible ] = useState( 10 )

	let throttle = useRef( undefined ).current

	// ///////////////////////////////
	// Offline cache
	// ///////////////////////////////
	useEffect( f => {

		// Schedule interface update (prevent mega-render bottleneck through redux)
		const throttleMs = 2000
		if( throttle ) clearTimeout( throttle )
		throttle = setTimeout( f => setNutshells( sortFormatAndCleanNutshells( getRichNutshells() ) ), throttleMs )

		if( loading ) return

		// Download nutshells not in cache
		const unavailableUids = getRichNutshells().filter( ( { unavailable } ) => !!unavailable ).map( ( { unavailable } ) => unavailable )
		setLoading( true )

		log( 'Retreiving unavailable uids: ', unavailableUids )
		Promise.all(
			unavailableUids.map( uid => {
				return app.getNutshellByUid( uid )
				// Remove from archive if nutshell was deleted from remote
				.then( n => {
					if( n.delete ) app.removeNutshellFromArchive( n.uid )
				} )
			} ) )
			.then( f => setLoading( false ) )
			.catch( e => catcher( 'Error bulk-getting offline nutshells: ', e )
		)


	}, [ offline.length, archive.length ] )

	// Lazyu load
	useEffect( f => {
		if( endReached && !loading ) setVisible( visible + 10 )
	}, [ endReached ] )

	// ///////////////////////////////
	// Sorting adn filtering
	// ///////////////////////////////
	function sortFormatAndCleanNutshells( nutshells=[] ) {

		// Filter out unavailable
		nutshells = nutshells.filter( ( { unavailable } ) => !unavailable )
		if( user?.muted?.length  ) nutshells = nutshells.filter( n => !user?.muted.includes( n.uid ) )
		nutshells = nutshells.filter( n => !n?.hidden )
		nutshells = nutshells.filter( n => !n?.delete )
		

		// Sort with recent edits up top
		nutshells = nutshells.sort( ( one, two ) => {
			if( one.updated > two.updated ) return -1
			if( one.updated < two.updated ) return 1
			return 0

		} )

		return nutshells
		
	}

	return <React.Fragment>
		
		{ nutshells.slice( 0, visible ).map( nutshell => <NutshellCard isArchive={ true } key={ nutshell.uid || Date.now() } nutshell={ nutshell } /> ) }
		{ !nutshells.length && <NutshellCard /> }
		{ ( ( visible < archive.length ) || loading ) && <NutshellCard />  }

	</React.Fragment>

} )

export const NutshellCard = memo( ( { gutter=40, index, isArchive=false, nutshell={}, showActions=true, avatarSize=100, status=false } ) => {

	// Extract data
	const { entries=[], audio=[], updated, published, user, uid, readcount } = nutshell

	// Check if this is my nutshell
	const myUid = useSelector( store => store?.user?.uid )
	const isSelf = user?.uid == myUid

	// Helpers
	const history = useHistory()
	const go = to => to && history.push( to )

	// Preventing self render, used by the underlying menu
	const [ selfIsHidden, hideSelf ] = useState( false )
	if( selfIsHidden ) return null

	// Mark nutshell as read
	function markRead() {

		hideSelf( true )
		return app.markNutshellRead( uid ).catch( catcher )
		
	}

	// During loading, show loading
	if( !uid ) return <Card>
			<ActivityIndicator />
	</Card>

	// If essential data is missing, do not render
	if( !entries?.length ) return null

	return <View style={ { ...( user && { paddingVertical: avatarSize/2 } ) } }>

		{ /* Nutshell card */ }
		<Card nativeID={ `nutshell-card-${index}` } style={ { paddingTop: user ? 0 : 30, paddingHorizontal: 0 } }>

			{ /* Avatar */ }
			{ user && <TouchableOpacity onPress={ f => go( `/${ user.handle }` ) } style={ { marginTop: -avatarSize/2, marginBottom: 20, width: '100%', alignItems: 'center', justifyContent: 'center' } }>
				<UserAvatar user={ user } size={ avatarSize } />
			</TouchableOpacity> }

			{ /* Nutshell content */ }
			<View style={ { flexDirection: 'column', alignItems: 'center', width: '100%', paddingHorizontal: gutter } }>

				{ /* If user attached to nutshell (wall view) show user data */ }
				{ user && <React.Fragment>
					<Title onPress={ f => go( `/${ user.handle }` ) }>{user.name}</Title>
					<HelperText style={ { paddingBottom: 10 } }>
						{ user?.handle && `@${user.handle}, ` }
						{ user && timestampToHuman( published || updated ) }
						{ /* readcount > 0 && `, read by ${readcount}` */ }
					</HelperText>
				</React.Fragment> }
				
				{ /* If no attached user (profile view) make date prominent */ }
				{ !user && <Title style={ { marginBottom: 30, fontSize: 17 } }>Week { weekNumber( published || updated ) }, { timestampToHuman( published || updated, 'y' ) }</Title> }

				
				<View style={ { width: '100%', alignItems: 'flex-start', justifyContent: 'center' } }>

					{ /* Audio entries */ }
					{ audio?.map( audioURI => <AudioEntry key={ audioURI || Math.random() } audioURI={ audioURI } /> ) }

					{ /* Text entries */ }
					{ entries?.map( entry => <Entry key={ entry.uid || Math.random() } entry={ entry } /> ) }

				</View>

			</View>

			{ /* If this is not your nutshell, and it is published */ }
			{ !isArchive && !isSelf && showActions && <NutshellActions gutter={ gutter } archive={ markRead } contactMethods={ user?.contactMethods } /> }

			{ /* If this is your nutshell and it is not yet published */ }
			{ isSelf && status && <Button style={ { marginHorizontal: gutter } } to='/nutshells/write'>Edit this {status} Nutshell</Button> }


			{ /* Menu dots */ }
			<NutshellOptions hideSelf={ hideSelf } isSelf={ isSelf } nutshell={ nutshell } style={ { position: 'absolute', right: 0, top: 0, marginTop: user ? 0 : -30, zIndex: 1 } } />


		</Card>

	</View>

} )

export const BottomTabs = ( { current, style, ...props } ) => {

	const history = useHistory()
	const theme = useSelector( store => store?.settings?.theme || {} )
	const unread = useSelector( store => store?.nutshells?.inbox?.length || 0 )

	// Nv shortcurs
	const inbox = f => history.push( '/nutshells/read/inbox' )
	const archive = f => history.push( '/nutshells/read/archive' )
	const isInbox = current == 'inbox'
	const isArchive = current == 'archive'

	return <Appbar style={ { elevation: 3, shadowOffset: { height: -1, width: 0 }, shadowRadius: 5, width: '100%', paddingLeft: 0, paddingRight: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: theme?.colors?.background, ...style } }>
		

				<TouchableRipple onPress={ inbox } style={ { flexDirection: 'row', flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: isInbox ? theme.colors?.primary : theme.colors?.surface } } >
					<React.Fragment>
						<Appbar.Action onPress={ inbox } color={ isInbox ? theme.colors?.surface : theme.colors?.primary } icon='mail' />
						<View style={ { flexDirection: 'row' } }>
							<Text style={ { color: isInbox ? theme.colors?.surface : theme.colors?.primary } }>Inbox</Text>
							{ !!unread && <Badge style={ { marginLeft: 10, backgroundColor: 'red' } }>{ unread }</Badge> }
						</View>
						
					</React.Fragment>
				</TouchableRipple>

				<TouchableRipple onPress={ archive } style={ { flexDirection: 'row', flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: isArchive ? theme.colors?.primary : theme.colors?.surface } } >
					<React.Fragment>
						<Appbar.Action onPress={ archive } color={ isArchive ? theme.colors?.surface : theme.colors?.primary } icon='archive' />
						<Text style={ { color: isArchive ? theme.colors?.surface : theme.colors?.primary } }>Archive</Text>
					</React.Fragment>
				</TouchableRipple>

	</Appbar>
}