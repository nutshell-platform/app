import React, { useState } from 'react'
import { ScrollView, View, StatusBar as Bar, SafeAreaView, Dimensions, Switch, TouchableOpacity } from 'react-native'
import { Card as PaperCard, Divider as PaperDivider, TextInput, Appbar, withTheme, ActivityIndicator, Title, Text, Button as PaperButton, HelperText, Avatar } from 'react-native-paper'

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

// Divider
export const Divider = ( { style, ...props } ) => <PaperDivider style={ { marginVertical: 20, ...style } } { ...props } />

// ///////////////////////////////
// Input components
// ///////////////////////////////

// Generic text input
export const Input = ( { style, info, error, ...props } ) => {

	 const [ showInfo, setInfo ] = useState( false )

	return <React.Fragment>
		<TextInput onFocus={ f => setInfo( true ) } onBlur={ f => setInfo( false ) } mode='flat' dense={ true } { ...props } style={ { marginVertical: 10, backgroundColor: 'none', ...style } } />
		{ ( showInfo || error ) && info && <HelperText style={ { paddingLeft: 0 } } type={ error ? 'error' : 'info' }>{ info }</HelperText> }
	</React.Fragment>
}

// Button
export const Button = ( { style, mode, children, ...props } ) => <PaperButton style={ { marginTop: 20, ...style } } mode={ mode || 'contained' } { ...props }>{ children }</PaperButton>

// Toggle
export const Toggle = withTheme( ( { style, theme, value, label, onToggle, info, error, ...props } ) => {

	const [ showInfo, setInfo ] = useState( false )

	return <View style={ { flexDirection: 'column', width: '100%' } }>

		{ /* The toggle */ }
		<View style={ { flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'flex-start', ...style } }>
			{ label && <Text onPress={ onToggle } style={ { opacity: .7, marginRight: 20 } }>{ label }</Text> }
			<Switch style={ { marginLeft: 'auto' } } onValueChange={ onToggle } trackColor={ value ? theme.colors.primary : theme.colors.background } thumbColor={ value ? theme.colors.primary : theme.colors.background } value={ value } { ...props } />
			{ info && <TouchableOpacity onPress={ f => setInfo( !showInfo ) }>
				<Avatar.Icon style={ { marginLeft: 10, backgroundColor: 'rgba(0,0,0,0)' } } color={ theme.colors.text } size={24} icon='information-outline' />
			</TouchableOpacity> }
		</View>

		{ /* Info helper message */ }
		{ info && ( showInfo || error ) && <HelperText style={ { paddingLeft: 0, paddingVertical: 20 } } type={ error ? 'error' : 'info' }>{ info }</HelperText> }

	</View>
} )

// ///////////////////////////////
// Screens
// ///////////////////////////////

// Loading screen
export const Loading = ( { message } ) => <Container style={ { justifyContent: 'center' } }>
		<ActivityIndicator size='large' />
		<Title style={ { textAlign: 'center', marginTop: 20 } }>{ message || 'Loading' }</Title>
</Container>

// ///////////////////////////////
// Positioning
// ///////////////////////////////
export const Main = {
	Center: ( { children, style } ) => ( <ScrollView showsHorizontalScrollIndicator={ false } showsVerticalScrollIndicator={ false } style={ { flex: 1 } } contentContainerStyle={ { minHeight: '100%', ...style } }>
		<View style={ { flex: 1, justifyContent: 'center', flexDirection: 'column' } }>
			{ children }
		</View>
	</ScrollView> ),
	Top: ( { children, style } ) => ( <ScrollView style={ { flex: 1 } } contentContainerStyle={ {  ...style } }>{ children }</ScrollView> )
}

// General app container
export const Container = withTheme( ( { style, children, theme } ) => <SafeAreaView style={ { flex: 1, backgroundColor: theme.colors.primary } }>

	<View style={ {
		flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', backgroundColor: theme.colors.background,
		...style
	} }>
		{ children }
	</View>
	
</SafeAreaView> )

// ///////////////////////////////
// Pass through exports straignt from paper
// ///////////////////////////////
export { Drawer, Portal, Appbar, withTheme, Surface, Text, Title, Subheading, HelperText, Avatar } from 'react-native-paper'