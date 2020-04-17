import React, { useState } from 'react'
import { ScrollView, View, StatusBar as Bar, SafeAreaView, Dimensions } from 'react-native'
import { Card as PaperCard, TextInput, Appbar, withTheme, ActivityIndicator, Title, Button as PaperButton, HelperText } from 'react-native-paper'

// Optimised react root component
export class Component extends React.Component {

  constructor( props ) {
    super( props )

    // Class-wide functions
    this.promiseState = newState => new Promise( resolve => this.setState( newState, resolve ) )
    this.updateState = updates => this.promiseState( { ...this.state, ...updates } )

  }

}

// ///////////////////////////////
// Recyclable components
// ///////////////////////////////
// General app container
export const Container = withTheme( ( { style, children, theme } ) => <SafeAreaView style={ { flex: 1, backgroundColor: theme.colors.primary } }>

	<View style={ {
		flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', backgroundColor: theme.colors.background,
		...style
	} }>
		{ children }
	</View>
	
</SafeAreaView> )

// Status bar
export const StatusBar = withTheme( ( { theme } ) => <View>
	<Bar backgroundColor={ theme.colors.primary } /> 
</View> )

// Generic card
export const Card = ( { containerStyle, style, children } ) => <View style={ { ...containerStyle, padding: 10, minWidth: 400, maxWidth: '100%' } }>
	<PaperCard elevation={ 2 } style={ { padding: 40, ...style } }>
		{ children }
	</PaperCard>
</View>

// Generic text input
export const Input = props => {

	 const [ showInfo, setInfo ] = useState( false )

	return <React.Fragment>
		<TextInput onFocus={ f => setInfo( true ) } mode='flat' dense={ true } { ...props } style={ { marginVertical: 10, backgroundColor: 'none', ...props.style } } />
		{ showInfo && props.info && <HelperText type='info'>{ props.info }</HelperText> }
	</React.Fragment>
}

// Button
export const Button = ( { style, mode, children, ...props } ) => <PaperButton style={ { marginTop: 20, ...style } } mode={ mode || 'contained' } { ...props }>{ children }</PaperButton>

// Loading screen
export const Loading = ( { message } ) => <Container style={ { justifyContent: 'center' } }>
		<ActivityIndicator size='large' />
		<Title style={ { textAlign: 'center', marginTop: 20 } }>{ message || 'Loading' }</Title>
</Container>

export const Main = {
	Center: ( { children, style } ) => ( <ScrollView showsHorizontalScrollIndicator={ false } showsVerticalScrollIndicator={ false } style={ { flex: 1 } } contentContainerStyle={ { minHeight: '100%', ...style } }>
		<View style={ { flex: 1, justifyContent: 'center', flexDirection: 'column' } }>
			{ children }
		</View>
	</ScrollView> ),
	Top: ( { children, style } ) => ( <ScrollView style={ { flex: 1 } } contentContainerStyle={ {  ...style } }>{ children }</ScrollView> )
}

// ///////////////////////////////
// Pass through exports straignt from paper
// ///////////////////////////////
export { Divider, Drawer, Portal, Appbar, withTheme, Surface, Text, Title, Avatar } from 'react-native-paper'