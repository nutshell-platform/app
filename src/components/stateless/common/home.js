import React, { memo } from 'react'
import { Card, Title, View, HelperText, Button, ToolTip } from '../common/generic'

// Helper functions
import { timestampToHuman, dateOfNext } from '../../../modules/helpers'


// Placeholder nutshell card
export const Placeholder = memo( ( { hasDraft, status='' } ) => <Card>
	<View style={ { flexDirection: 'column', alignItems: 'center', width: '100%' } }>
		<Title>{ hasDraft ? 'Edit' : 'Draft' } your { `${ status } ` || 'next ' }Nutshell</Title>
		<View style={ { width: '100%', alignItems: 'flex-start', justifyContent: 'center' } }>
			<ToolTip textStyle={ { textAlign: 'center' } } label={ `Next Nutshells release: midnight ${ timestampToHuman( dateOfNext( 'sunday' ) ) }.` }
			info={ `Nutshells are released on sunday midnight. The only reason to come back to this app until then is to draft your own Nutshell. We're not trying to get you hooked, there are plenty of other social networks for that.` } />
			<Button style={ { alignSelf: 'center' } } to='/nutshells/write'>{ hasDraft ? 'Edit' : 'Draft' } your Nutshell</Button>
		</View>

	</View>
</Card> )

// View recommendations card
export const ViewRecs = memo( ( { recAmount } ) => <Card>
	<View style={ { flexDirection: 'column', alignItems: 'center', width: '100%' } }>
		{ recAmount > 0 && <Title style={ { textAlign: 'center', marginBottom: 15 } }>You have { recAmount } friend suggestions!</Title> }
		{ !recAmount && <Title style={ { textAlign: 'center', marginBottom: 15 } }>We can help you find your friends!</Title> }
		<View style={ { width: '100%', alignItems: 'flex-start', justifyContent: 'center' } }>
			<HelperText style={ { textAlign: 'center' } }>We use "friends of friends" and optionally your contact book to find your friends.</HelperText>
			<Button style={ { alignSelf: 'center' } } to='/friends/find'>View recommendations</Button>
		</View>

	</View>
</Card> )

