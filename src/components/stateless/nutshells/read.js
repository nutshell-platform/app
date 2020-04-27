import React, { useState } from 'react'
import { timestampToHuman } from '../../../modules/helpers'
import { TouchableOpacity } from 'react-native'
import { Card, Title, Paragraph, View, HelperText, IconButton, Divider } from '../common/generic'

export const NutshellCard = ( { nutshell={}, follow, unfollow } ) => {

	const { entries, updated } = nutshell

	return <Card style={ { paddingVertical: 20 } }>
		<View style={ { flexDirection: 'column', alignItems: 'center', width: '100%' } }>
			<HelperText style={ { paddingBottom: 10 } }>{ timestampToHuman( updated ) }</HelperText>

			<View style={ { width: '100%', alignItems: 'flex-start', justifyContent: 'center' } }>
				{ entries.map( entry => <Entry key={ entry.uid } entry={ entry } /> ) }
			</View>

		</View>
	</Card>

}

export const Entry = ( { entry } ) => {

	const [ open, setOpen ] = useState( false )

	return <View style={ { width: '100%', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' } }>
		<TouchableOpacity onPress={ f => setOpen( !open ) } style={ { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start', width: '100%' } }>
			<Title style={ { fontSize: 18 } }>{ entry.title }</Title>
			<IconButton style={ { marginLeft: 'auto', height: '100%' } } size={ 18 } icon={ open ? 'minus' : 'plus' } />
		</TouchableOpacity>

		{ open && <Paragraph style={ { paddingVertical: 20 } }>{ entry.paragraph }</Paragraph> }
		
	</View>

}