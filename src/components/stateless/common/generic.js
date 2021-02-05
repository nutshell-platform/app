import React, { useState, useRef, Profiler as ReactProfiler } from 'react'
import { useSelector } from 'react-redux'
import { log } from '../../../modules/helpers'

// Visual
const Color = require('color')
import { ScrollView, View as NativeView, StatusBar as Bar, SafeAreaView, Switch, TouchableOpacity, Pressable, Image, KeyboardAvoidingView } from 'react-native'
import { Card as PaperCard, Divider as PaperDivider, TextInput, Appbar, withTheme, ActivityIndicator as PaperActivityIndicator, Title, Text, Button as PaperButton, HelperText as PaperHelperText, Avatar, Subheading as PaperSubheading, Searchbar, Checkbox as PaperCheckbox, IconButton } from 'react-native-paper'
import { Link as NativeLink, withRouter, useHistory } from '../../../routes/router'
import { isWeb, isIos, isCI } from '../../../modules/apis/platform'

// CI config
const ActivityIndicator = isCI ? ( f => false ) : PaperActivityIndicator

// Actions
import * as Linking from 'expo-linking'

// Optimised react root component
export class Component extends React.Component {

  constructor( props ) {
    super( props )

    // Class-wide functions
    this.promiseState = newState => new Promise( resolve => this.setState( newState, resolve ) )
    this.updateState = updates => this.promiseState( { ...this.state, ...updates } )
    this.updateStateSync = updates => this.setState( { ...this.state, ...updates } )


  }

}

// Profiling
export const Profiler = ( { children, threshold=10, ...props } ) => {

	const logPerformance = ( id, phase, actualDuration, baseDuration, startTime, commitTime, interactions ) => {
		if( threshold < actualDuration ) log( `[ profiler ] ${ Math.floor( actualDuration ) } ms - ${ id } - ${ phase } ` )
	}

	return <ReactProfiler { ...props } onRender={ logPerformance }>
		{ children }
	</ReactProfiler>
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
export const Card = ( { containerStyle, style, children, ...props } ) => <View style={ { ...containerStyle, paddingVertical: 10, width: 500, maxWidth: '100%' } } { ...props } >
	<PaperCard elevation={ 2 } style={ { padding: 30, maxWidth: '100%', ...style } }>
		{ children }
	</PaperCard>
</View>

// Modified view with sensible defaults
export const View = ( { style, ...props } ) => <NativeView style={ { maxWidth: '100%', ...style } } { ...props } />

// Divider
export const Divider = ( { style, ...props } ) => <PaperDivider style={ { marginVertical: 20, ...style } } { ...props } />

// Profile image
export const UserAvatar = React.memo( ( { size=100, user, ...props } ) => {

	const history = useHistory()

	return <TouchableOpacity onPress={ f => history.push( `/${user.handle}` ) }>
		{ user.avatar && <Avatar.Image { ...props } size={ size } source={ user.avatar } /> }
		{ !user.avatar && <Avatar.Icon { ...props } size={ size } icon='account-circle-outline' /> }
	</TouchableOpacity>
} )

// Tooltip
export const ToolTip = React.memo( ( { iconSize=30, containerStyle, tooltipStyle, textStyle, label, info, ...props } ) => {

	const theme = useSelector( store => store?.settings?.theme || {} )
	const [ showInfo, setInfo ] = useState( false )

	return <TouchableOpacity style={ { width: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', ...containerStyle } } onPress={ f => setInfo( !showInfo ) } { ...props }>
		<View style={ { flexDirection: 'row', alignItems: 'center', paddingTop: 10, paddingBottom: showInfo ? 0 : 10, ...tooltipStyle } }>
			<Text style={ { ...textStyle } }>{ label }</Text>

			{ /* The info icon */ }
			{ info && <Avatar.Icon style={ { backgroundColor: 'rgba(0,0,0,0)' } } color={ theme.colors.text } size={ iconSize } icon='information-outline' /> }
		</View>

		{ /* the help message triggeres by the info icon */ }
		{ showInfo && info && <PaperHelperText style={ { paddingBottom: 10, textAlign: 'center', ...tooltipStyle } } type={ 'info' }>{ info }</PaperHelperText> }

	</TouchableOpacity>
} )

export const HelperText = ( { icon, ...props } ) => !icon ? <PaperHelperText { ...props } /> : <View style={ { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' } }>
	<PaperHelperText { ...props } />
	<IconButton style={ { opacity: .8, margin: 0 } } icon={ icon } size={ 15 } />
</View>

export const Link = withTheme( ( { style, theme, children, to, onPress, underline=true, ...props } ) => {

	const text = <Text style={ { color: theme.colors.text, textDecorationLine: 'none', ...theme.fonts.regular, ...style } }>{ children }</Text>
	if( to?.includes( 'http' ) || to?.includes( 'mailto' ) || onPress ) return <TouchableOpacity { ...props } onPress={ onPress || ( f => Linking.openURL( to ) ) } style={ { paddingTop: 1, marginHorizontal: 5, ...( underline && { borderBottomWidth: .2 } ) } }>
		{ text }
	</TouchableOpacity>

	return <TouchableOpacity onPress={ onPress } { ...props }>
		<NativeLink style={ { textDecorationLine: 'none' } } to={ to }>
			{ text }
		</NativeLink>
	</TouchableOpacity>
} )

// ///////////////////////////////
// Input components
// ///////////////////////////////

// Generic text input
const inputMemoCompare = ( prev, next ) => prev.hideInfo == next.hideInfo && prev.value == next.value

export const Input = React.memo( ( { style, info, hideInfo=false, error, onSubmit, multiline, iconSize=30, value, ...props } ) => {

	// Theme
	const theme = useSelector( store => store?.settings?.theme )

	// Internal variables
	const [ showInfo, setInfo ] = useState( false )
	const [ height, setHeight ] = useState( multiline ? 100 : undefined )

	// Styles
	const inputStyles = { ...( height && { height: height } ), minHeight: 50, marginVertical: 10, backgroundColor: multiline ? theme.colors.background : 'none', ...style }

	// Internal helpers
	const adjustHeight = ( { nativeEvent } ) => {
		if( multiline ) setHeight( nativeEvent?.contentSize?.height + ( isIos ? 35 : 0 ) )
		focusOnMe(  )
	}
	const manageEnter = ( { nativeEvent } ) => {
		if( nativeEvent.key == 'Enter' ) return onSubmit()
	}

	// Scroll input into view when it is selected
	const ref = useRef()
	const focusOnMe = f => ref?.current?.scrollIntoView && ref?.current?.scrollIntoView()


	return <Pressable ref={ ref } onPress={ focusOnMe }>
		<View style={ { position: 'relative' } }>

			{ /* The actual input */ }
			<TextInput onKeyPress={ onSubmit ? manageEnter : f => f } value={ value || '' } onContentSizeChange={ adjustHeight } multiline={ multiline } mode='flat' dense={ false } { ...props } style={ inputStyles } />

			{ /* The info icon */ }
			{ info && ( !hideInfo || ( hideInfo && !value ) ) && <TouchableOpacity tabindex={ -1 } style={ { position: 'absolute', right: 0, top: 0, bottom: 0, justifyContent: 'center' } } onPress={ f => setInfo( !showInfo ) }>
				<Avatar.Icon style={ { backgroundColor: 'rgba(0,0,0,0)', alignSelf: 'center' } } color={ theme.colors.text } size={ iconSize } icon='information-outline' />
			</TouchableOpacity> }
		</View>

		{ /* the help message triggeres by the info icon */ }
		{ ( showInfo || error ) && ( info || error ) && <PaperHelperText type={ error ? 'error' : 'info' }>{ error || info }</PaperHelperText> }
	</Pressable>
}, inputMemoCompare )

// Button
export const Button = ( { style, color, mode='contained', loading=false, children, to, onPress, ...props } ) => {

	const theme = useSelector( store => store?.settings?.theme || {} )
	const history = useHistory()
	const buttonStyle = { flexDirection: 'column', alignItems: 'stretch', justifyContent: 'center', flexGrow: 1, flexShrink: 1 }

	const handleLink = link => {
		if( link.includes( 'http' ) || link.includes( 'mailto:' ) ) return Linking.openURL( link )
		return history.push( link )
	}

	return <View style={ { position: 'relative', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginTop: 20, ...style } }>
		{ children && <PaperButton
				onPress={ to ? f => handleLink( to ) : onPress }
				style={ buttonStyle }
				contentStyle={ { width: '100%' } }
				labelStyle={ { color: mode != 'contained' ? theme.colors.text : theme.colors.surface } }		
				mode={ mode } { ...props }
			>
				{ children }
				{ loading && <ActivityIndicator size={ 10 } color={ mode != 'contained' ? theme.colors.text : theme.colors.background } style={ { height: 20, width: 20, paddingLeft: 20 } } /> }
			</PaperButton> }
		{ !children && <IconButton
			color={ color || theme?.colors?.primary }
			onPress={ to ? f => handleLink( to ) : onPress }
			{ ...props }
		/> }
		
	</View>
}


// Toggle
const toggleMemoCompare = ( prev, next ) => prev.value == next.value
export const Toggle = React.memo( ( { style, value, label, onToggle, info, error, ...props } ) => {

	const theme = useSelector( store => store?.settings?.theme || {} )
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
		{ info && ( showInfo || error ) && <PaperHelperText style={ { paddingLeft: 0, paddingVertical: 20 } } type={ error ? 'error' : 'info' }>{ info }</PaperHelperText> }

	</View>
}, toggleMemoCompare )

// Search bar
export const Search = ( { style, searching, ...props } ) => <View>
	<Searchbar { ...props } />
	{ searching && <ActivityIndicator style={ { position: 'absolute', right: 0, height: '100%', paddingHorizontal: 15, backgroundColor: 'white' } } /> }
</View>

// Checkbox
export const Checkbox = ( { checked, children, onPress, style, ...props } ) => <View style={ { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', ...style } } { ...props }>
	<PaperCheckbox.Android onPress={ onPress } status={ checked ? 'checked' : 'unchecked' } />
	{ children }
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
const sharedStyles = { paddingHorizontal: 10, paddingVertical: 40, maxWidth: '100%', flexGrow: 1, flexShrink: 0 }
export const Main = {
	Center: ( { children, style } ) => ( <ScrollView style={ { maxWidth: '100%' } } showsHorizontalScrollIndicator={ false } showsVerticalScrollIndicator={ false } contentContainerStyle={ { ...sharedStyles, alignItems: 'center', justifyContent: 'center',  ...style } }>
			{ children }
	</ScrollView> ),
	Top: ( { children, style } ) => ( <ScrollView style={ { maxWidth: '100%' } } showsHorizontalScrollIndicator={ false } showsVerticalScrollIndicator={ false } contentContainerStyle={ { ...sharedStyles, ...style } }>{ children }</ScrollView> )
}

// General app container
const bgStyles = { position: 'absolute', top: 0, left: 0, bottom: 0, minWidth: '100%', minHeight: '100%', opacity: 0.5 }
export const Container = withTheme( ( { style, children, theme, Background } ) => <KeyboardAvoidingView style={ { flex: 1 } } behavior={ isIos ? 'padding' : 'height' } >
		<SafeAreaView style={ { flex: 1, width: '100%', backgroundColor: theme.colors.primary } }>

		<View style={ {
			flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', backgroundColor: theme.colors.background, overflow: 'hidden',
			...style
		} }>
			{ Background && ( isWeb ? <Image style={ bgStyles } source={ Background } /> : <Background height={ '101%' } preserveAspectRatio="xMidYMid slice" style={ bgStyles } /> ) }
			{ Background && <View style={ { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: Color( theme.colors.background ).alpha( 0.9 ) } } /> }
			{ children }
		</View>
		
	</SafeAreaView>
</KeyboardAvoidingView> )

// ///////////////////////////////
// Pass through exports straignt from paper
// ///////////////////////////////
export { ProgressBar, Drawer, Provider, FAB, Portal, Appbar, withTheme, Surface, Text, Paragraph, Title, Avatar, Caption, IconButton, Menu, ActivityIndicator } from 'react-native-paper'