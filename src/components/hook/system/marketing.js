import React, { useState, memo } from 'react'

// Visual
import Navigation from '../../stateful/common/navigation'
import { Container, Main, Title, Subheading, Card, Input, Toggle, Button, Divider } from '../../stateless/common/generic'

// Data
import { catcher, log, Dialogue } from '../../../modules/helpers'
import app from '../../../modules/firebase/app'


export const Marketing = memo( ( { isRecording=false } ) => {

	// Message data
	const [ title, setTitle ] = useState( '' )
	const [ message, setMessage ] = useState( '' )
	const [ link, setLink ] = useState( undefined )
	const [ androidLink, setAndroidLink ] = useState( undefined )
	const [ iosLink, setIosLink ] = useState( undefined )
	const [ webLink, setWebLink ] = useState( undefined )
	const [ sendState, setSendState ] = useState( false )

	const triggerSend = async f => {

		try {

			setSendState( 'Sending...' )

			if( !title || !message ) throw 'Message is missing content'

			const go = await Dialogue( 'Are you very sure you want to send?', 'This cannot be undone', [
				{ text: 'Yes, send it', onPress: async f => true },
				{ text: 'No! Stop!', onPress: async f => false }
			] )

			if( !go ) return Dialogue( 'Message was not sent', 'You can continue editing' )

			// Structure message as Api expects and sent it
			if( go ) await app.sendMassMessage( {
				title: title,
				message: message,
				...( link && { goto: link } ),
				...( ( iosLink || androidLink || webLink ) && {
					links: {
						android: androidLink,
						ios: iosLink,
						web: webLink
					}
				} )
			} )

			setSendState( 'Message sent!' )

		} catch( e ) {
			setSendState( 'Error ocurred' )
			Dialogue( 'Error sending message', e.message || e )
			catcher( e )
		}

	}


	return <Container>
		<Navigation title='Marketing' />
		<Main.Top style={ { width: 500 } }>
			
			<Card>
				
				<Title>Blast push notification</Title>

				<Subheading>Message text</Subheading>
				<Input label='Title' value={ title } onChangeText={ setTitle } />
				<Input label='Message' value={ message } onChangeText={ setMessage } />

				{ /* Linking */ }
				<Subheading>Message links</Subheading>
				{ !androidLink && !iosLink && !webLink && <Input label='Universal goto link' value={ link } onChangeText={ setLink } /> }

				{ !link && <React.Fragment>
					<Input label='Android link' value={ androidLink } onChangeText={ setAndroidLink } />
					<Input label='Ios link' value={ iosLink } onChangeText={ setIosLink } />
					<Input label='Web/fallback link' value={ webLink } onChangeText={ setWebLink } />
				</React.Fragment> }

				<Divider />

				<Toggle label='Ready to send' info='Only toggle this when ready to send' value={ !!sendState } onToggle={ f => setSendState( sendState ? false : 'Send the message' ) } />

				{ sendState && <Button onPress={ triggerSend } style={ { marginTop: 50 } }>{ sendState  }</Button> }

			</Card>

		</Main.Top>
	</Container>
} )