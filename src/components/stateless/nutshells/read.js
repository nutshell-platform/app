import React, { useState, memo } from 'react'


// Visual
import { NutshellActions, NutshellOptions, Entry } from './_read_text_entry'
import { AudioEntry } from './_read_audio_entry'

// Hooks
import { useSelector } from 'react-redux'
import { useHistory } from '../../../routes/router'
import app from '../../../modules/firebase/app'

// Visual
import { Card, Title, Paragraph, View, HelperText, IconButton, Button, UserAvatar } from '../common/generic'
import Tutorial from '../../stateful/onboarding/tutorial'
import { Placeholder, ViewRecs } from '../common/home'



// Helper functions
import { timestampToHuman, log } from '../../../modules/helpers'
import { TouchableOpacity } from 'react-native'

export const InboxTimeline = memo( ( { renderInbox, ...props } ) => {

	const user = useSelector( store => store?.user )
	const { inbox={}, draft={} } = useSelector( store => store?.nutshells )

	return <React.Fragment>
		<Tutorial />
		{ renderInbox?.length > 0 && renderInbox.map( ( nutshell, index ) => <NutshellCard index={ index } key={ nutshell.uid } nutshell={ nutshell } /> ) }
		<ViewRecs recAmount={ user.recommendations?.length } />
		{ inbox.length == 0 && <Placeholder status={ draft.status } hasDraft={ draft.entries?.length != 0 } /> }
	</React.Fragment>

} )

export const NutshellCard = memo( ( { gutter=40, index, nutshell={}, showActions=true, avatarSize=100, status=false } ) => {

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
		return app.markNutshellRead( uid )
		
	}

	return <View style={ { ...( user && { paddingVertical: avatarSize/2 } ) } }>

		{ /* Nutshell card */ }
		<Card nativeID={ `nutshell-card-${index}` } style={ { paddingTop: user ? 0 : 30, paddingHorizontal: 0 } }>

			{ /* Avatar */ }
			{ user && <TouchableOpacity onPress={ f => go( `/${ user.handle }` ) } style={ { marginTop: -avatarSize/2, marginBottom: 20, width: '100%', alignItems: 'center', justifyContent: 'center' } }>
				<UserAvatar user={ user } size={ avatarSize } />
			</TouchableOpacity> }

			{ /* Nutshell content */ }
			<View style={ { flexDirection: 'column', alignItems: 'center', width: '100%', paddingHorizontal: gutter } }>

				{ user && <Title onPress={ f => go( `/${ user.handle }` ) }>{user.name}</Title> }
				<HelperText style={ { paddingBottom: 10 } }>
					{ user && `@${user.handle}, ` }
					{ timestampToHuman( published || updated ) }
					{ readcount > 0 && `, read by ${readcount}` }
				</HelperText>


				
				<View style={ { width: '100%', alignItems: 'flex-start', justifyContent: 'center' } }>

					{ /* Audio entries */ }
					{ audio?.map( audioURI => <AudioEntry key={ audioURI || Math.random() } audioURI={ audioURI } /> ) }

					{ /* Text entries */ }
					{ entries?.map( entry => <Entry key={ entry.uid || Math.random() } entry={ entry } /> ) }

				</View>

			</View>

			{ /* If this is not your nutshell, and it is published */ }
			{ !isSelf && showActions && <NutshellActions gutter={ gutter } archive={ markRead } contactMethods={ user?.contactMethods } /> }

			{ /* If this is your nutshell and it is not yet published */ }
			{ isSelf && status && <Button style={ { marginHorizontal: gutter } } to='/nutshells/write'>Edit this {status} Nutshell</Button> }


			{ /* Menu dots */ }
			<NutshellOptions hideSelf={ hideSelf } isSelf={ isSelf } nutshell={ nutshell } style={ { position: 'absolute', right: 0, top: 0, marginTop: user ? 0 : -30, zIndex: 1 } } />


		</Card>

	</View>

} )