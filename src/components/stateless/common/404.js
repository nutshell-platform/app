import React, { useState } from 'react'
import { Container, Main, Title, Paragraph, View, Button } from './generic'
import Navigation from '../../stateful/common/navigation'

export default ( { props } ) => {

	const [ beNice, toggle ] = useState( false )

	return <Container>
	<Navigation title={ `Teapot - 14` } />
	<Main.Center style={ { width: 400 } }>
		<View style={ { alignItems: 'center', justifyContent: 'center', padding: 20 } }>
			<Title style={ { marginBottom: 20 } }>404</Title>
			<Paragraph style={ { textAlign: 'center' } }>
				{ !beNice && 'Something broke. After careful analysis we determined it was your fault.' }
				{ beNice && `Page not found. Either you mistyped a url or something in our system broke. Let's not point fingers.` }
			</Paragraph>
			<Paragraph style={ { marginTop: 20, textAlign: 'center' } }>
				{ !beNice && `Just in case we've logged the problem and will try to fix it. Not because we made a mistake though. That was on you. We would never make mistakes.` }
				{ beNice && `We've logged the problem and suggest you go to a different page` }
			</Paragraph>

			{ !beNice && <Button onPress={ f => toggle( !beNice ) }>Question self reflection</Button> }
		</View>
	</Main.Center>
</Container>

}