import React, { useState, useEffect } from 'react'
import { TouchableOpacity } from 'react-native'

// Visual
import { Container, Main, Card, View, UserAvatar, Link, ActivityIndicator, Text, Title } from '../common/generic'
import Navigation from '../common/navigation'

// Functionality
import { log, catcher } from '../../../modules/helpers'
import app from '../../../modules/firebase/app'
import { useHistory } from '../../../routes/router'
import { useSelector } from 'react-redux'


// ///////////////////////////////
// Render component
// ///////////////////////////////
export default function ListUsers( { isSelf, username, users=[], filter='' } ) {

	const history = useHistory()

	// ///////////////////////////////
	// Redux handling
	// ///////////////////////////////


	// ///////////////////////////////
	// State handling
	// ///////////////////////////////
	const [ profiles, setProfiles ] = useState( [] )
	const [ loading, setLoading ] = useState( true )


	// ///////////////////////////////
	// Lifecycle handling
	// ///////////////////////////////
	useEffect( f => {

		Promise.all( users.map( uid => app.getPerson( uid, 'uid' ) ) )
		.then( users => {
			log( 'Profiles loaded: ', users, ' from ', users )
			setProfiles( users.sort( sort_by_score ) )
		} )
		.finally( f => setLoading( false ) )

	}, [ users.length, filter ] )


	// ///////////////////////////////
	// Component functions
	// ///////////////////////////////

	// Sort by score
	const sort_by_score = ( one, two ) => {
		if( one.score > two.score ) {
			// log( one, 'won from', two )
			return 1
		}
		if( one.score < two.score ) {
			// log( two, 'won from', one )
			return -1
		}
		return 0
	}


	// ///////////////////////////////
	// Render component
	// ///////////////////////////////
	return <Main.Top>

			{ !isSelf && username && <Title>{ filter == 'following' ? `${ username } follows:` : `${ username }'s followers:` }</Title> }
			{ isSelf && <Title>{ filter == 'following' ? `You follow:` : `Your followers:` }</Title> }

			{ loading && [ 0, 1 ].map( i => <Card key={ `${ filter }-placeholder-${ i }` }>
					<ActivityIndicator />
			</Card> ) }
			
			{ profiles?.map( user => <Card style={ { padding: 0 } } key={ user.uid }>

				<TouchableOpacity style={ { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', padding: 10 } } onPress={ f => history.push( `/${user.handle}` ) }>
					<UserAvatar style={ { marginRight: 20 } } size={ 50 } user={ user } />
					<Text>{ user.name }</Text>
					<Text style={ { opacity: .6, marginLeft: 'auto' } }>@{ user.handle }</Text>
				</TouchableOpacity>
									
						
			</Card> ) }

	</Main.Top>

}