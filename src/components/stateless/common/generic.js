import React, { useState } from 'react'
import { ScrollView, View as NativeView, StatusBar as Bar, SafeAreaView, Switch, TouchableOpacity } from 'react-native'
import { Card as PaperCard, Divider as PaperDivider, TextInput, Appbar, withTheme, ActivityIndicator, Title, Text, Button as PaperButton, HelperText, Avatar, Subheading as PaperSubheading, Searchbar } from 'react-native-paper'
import { Link as NativeLink } from '../../../routes/router'

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

// Subheading
export const Subheading = ( { style, ...props } ) => <PaperSubheading style={ { marginTop: 20, ...style } } { ...props } />

// Generic card
export const Card = ( { containerStyle, style, children } ) => <View style={ { ...containerStyle, paddingVertical: 10, width: 500, maxWidth: '100%' } }>
	<PaperCard elevation={ 2 } style={ { padding: 40, maxWidth: '100%', ...style } }>
		{ children }
	</PaperCard>
</View>

// Modified view with sensible defaults
export const View = ( { style, ...props } ) => <NativeView style={ { maxWidth: '100%', ...style } } { ...props } />

// Divider
export const Divider = ( { style, ...props } ) => <PaperDivider style={ { marginVertical: 20, ...style } } { ...props } />

// Profile image
export const UserAvatar = ( { size=100, user, ...props } ) => user.avatar ? <Avatar.Image { ...props } size={ size } source={ user.avatar.uri } /> : <Avatar.Icon { ...props } size={ size } icon='account-circle-outline' />

// Tooltip
export const ToolTip = withTheme( ( { iconSize=30, containerStyle, tooltipStype, label, info, theme, ...props } ) => {

	const [ showInfo, setInfo ] = useState( false )

	return <TouchableOpacity style={ { width: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', ...containerStyle } } onPress={ f => setInfo( !showInfo ) } { ...props }>
		<View style={ { flexDirection: 'row', alignItems: 'center', paddingTop: 10, paddingBottom: showInfo ? 0 : 10, ...tooltipStype } }>
			<Text>{ label }</Text>

			{ /* The info icon */ }
			{ info && <Avatar.Icon style={ { backgroundColor: 'rgba(0,0,0,0)' } } color={ theme.colors.text } size={ iconSize } icon='information-outline' /> }
		</View>

		{ /* the help message triggeres by the info icon */ }
		{ showInfo && info && <HelperText style={ { paddingBottom: 10, textAlign: 'center', ...tooltipStype } } type={ 'info' }>{ info }</HelperText> }

	</TouchableOpacity>
} )

export const Link = withTheme( ( { style, theme, ...props } ) => <NativeLink
	style={ { color: theme.colors.text, textDecorationLine: 'none', ...theme.fonts.regular, ...style } }
	{ ...props }
/> )

// ///////////////////////////////
// Input components
// ///////////////////////////////

// Generic text input
export const Input = withTheme( ( { theme, style, info, hideInfo=false, error, onSubmit, multiline, iconSize=30, value, ...props } ) => {

	 const [ showInfo, setInfo ] = useState( false )
	 const [ height, setHeight ] = useState( undefined )
	 const adjustHeight = ( { nativeEvent } ) => {
	 	if( multiline ) setHeight( nativeEvent?.contentSize?.height )
	 }
	 const defaultHeight = f => setHeight( multiline ? 100 : undefined )
	 const manageEnter = ( { nativeEvent } ) => {
	 	if( nativeEvent.key == 'Enter' ) return onSubmit()
	 }

	return <View>
		<View style={ { position: 'relative' } }>

			{ /* The actual input */ }
			<TextInput onKeyPress={ onSubmit ? manageEnter : f => f } value={ value || '' } onFocus={ defaultHeight } onContentSizeChange={ adjustHeight } multiline={ multiline } mode='flat' dense={ false } { ...props } style={ { ...( height && { height: height } ),marginVertical: 10, backgroundColor: multiline ? theme.colors.background : 'none', ...style } } />

			{ /* The info icon */ }
			{ info && ( !hideInfo || ( hideInfo && !value ) ) && <TouchableOpacity tabindex={ -1 } style={ { position: 'absolute', right: 0, top: 0, bottom: 0, justifyContent: 'flex-start' } } onPress={ f => setInfo( !showInfo ) }>
				<Avatar.Icon style={ { backgroundColor: 'rgba(0,0,0,0)', marginTop: iconSize } } color={ theme.colors.text } size={ iconSize } icon='information-outline' />
			</TouchableOpacity> }
		</View>

		{ /* the help message triggeres by the info icon */ }
		{ ( showInfo || error ) && ( info || error ) && <HelperText type={ error ? 'error' : 'info' }>{ error || info }</HelperText> }
	</View>
} )

// Button
export const Button = withTheme( ( { style, mode='contained', loading=false, children, to, theme, ...props } ) => <PaperButton labelStyle={ { paddingRight: loading ? 30 : 0 } } style={ { marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', ...style } } mode={ mode } { ...props }>
	{ to ? <Link style={ { color: mode != 'contained' ? theme.colors.text : theme.colors.surface, height: '100%' } } to={ to }>{ children }</Link> : children }
	{ loading && <ActivityIndicator color={ mode != 'contained' ? theme.colors.text : theme.colors.background } style={ { position: 'absolute', top: 0, right: 0, padding: 10, height: '100%' } } /> }
</PaperButton> )


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

// Search bar
export const Search = ( { style, searching, ...props } ) => <View>
	<Searchbar { ...props } />
	{ searching && <ActivityIndicator style={ { position: 'absolute', right: 0, height: '100%', paddingHorizontal: 15, backgroundColor: 'white' } } /> }
</View>

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
const sharedStyles = { paddingHorizontal: 10, paddingVertical: 40, maxWidth: '100%' }
export const Main = {
	Center: ( { children, style } ) => ( <ScrollView showsHorizontalScrollIndicator={ false } showsVerticalScrollIndicator={ false } style={ { flex: 1, ...sharedStyles } } contentContainerStyle={ { maxWidth: '100%', minHeight: '100%', ...style } }>
		<View style={ { flex: 1, justifyContent: 'center', flexDirection: 'column' } }>
			{ children }
		</View>
	</ScrollView> ),
	Top: ( { children, style } ) => ( <ScrollView style={ { flex: 1, ...sharedStyles } } contentContainerStyle={ { maxWidth: '100%', ...style } }>{ children }</ScrollView> )
}

// General app container
export const Container = withTheme( ( { style, children, theme } ) => <SafeAreaView style={ { flex: 1, width: '100%', backgroundColor: theme.colors.primary } }>

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
export { Drawer, Portal, Appbar, withTheme, Surface, Text, Paragraph, Title, HelperText, Avatar, Caption, IconButton } from 'react-native-paper'