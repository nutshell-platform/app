import React from 'react'
import { Component, Loading, Card, Title, Text, Button } from '../../stateless/common/generic'
import { connect } from 'react-redux'

class Tutorial extends Component {


	render() {

		const { user } = this.props

		const todos = []

		if( !user?.avatar ) todos.push( { label: 'Set your avatar', to: '/user/settings' } )
		if( !user?.bio ) todos.push( { label: 'Update your bio', to: '/user/settings' } )
		if( !user?.following?.length ) todos.push( { label: 'Follow some people', to: '/friends/find' } )

		// No todos? No component
		if( !todos.length ) return null

		return <Card>
			<Title>Welcome {user.name} 🎉</Title>
			<Text style={ { paddingTop: 20 } }>To make the most out of Nutshell, we recommend doing the following things:</Text>
			{ todos.map( ( { label, to } ) => <Button key={ label } to={ to }>{ label }</Button> ) }
		</Card>

	}

}

export default connect( store => ( {
	user: store.user
} ) )( Tutorial )
