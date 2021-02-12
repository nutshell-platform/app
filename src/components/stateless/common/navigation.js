import React, { useState, memo } from 'react'

// Data
import { useSelector, useDispatch } from 'react-redux'
import { toggleDarkMode } from '../../../redux/actions/settingsActions'
import { useHistory } from '../../../routes/router'

// Visual
import { TouchableOpacity, View, Animated, SafeAreaView } from 'react-native'
import { Drawer, Portal, Appbar, withTheme, Surface, Text, StatusBar, Toggle } from './generic'
import { PanGestureHandler } from 'react-native-gesture-handler'
import { isWeb, version } from '../../../modules/apis/platform'
import { updateIfAvailable } from '../../../modules/apis/updates'

// ///////////////////////////////
// Header
// ///////////////////////////////
export const Header = ( { style, back, title, subtitle, toggle, pan, drawer, drawerWidth, drawerTranslate, children, links } ) => <View style={ { width: '100%' } }>
	<StatusBar />
	<Appbar.Header style={ { width: '100%', paddingVertical: 30, ...( !back && { paddingLeft: 20 } ), ...style } } statusBarHeight={ 0 }>
		{ back && <Appbar.BackAction onPress={ back } /> }
		<Appbar.Content title={ title } subtitle={ subtitle }/>
		{ children }
		<Appbar.Action nativeID='navigation-toggle' icon="menu" onPress={ toggle } />
	</Appbar.Header>
	{ drawer && <Menu links={ links } translate={ drawerTranslate } width={ drawerWidth } pan={ pan } toggle={ toggle } /> }
</View>

// ///////////////////////////////
// Sidebar
// ///////////////////////////////

// Dark mode
const DarkMode = ( { toggleDark, theme } ) => <View style={ { flexDirection: 'row', paddingHorizontal: 40, paddingVertical: 20, borderTopWidth: 1, borderTopColor: theme.colors.divider } }>
	<Toggle label='Dark mode' onToggle={ toggleDark } value={ theme.dark } />
</View>

// Backdrop of menu
const Backdrop = ( { children, width, toggle, pan, ...props } ) => <Portal style={ { alignItems: 'center', justifyContent: 'center' } }>

	{  /* Touchable backdrop that closes the sidebar */ }
	<TouchableOpacity activeOpacity={ 1 } onPress={ toggle } style={ { flex: 1 } }>

		{ /* The actual sidebar */ }
		<TouchableOpacity activeOpacity={ 1 } style={ { height: isWeb ? '100vh' : '100%', width: width, maxWidth: '100%', alignSelf: 'flex-end' } }>

			{ /* Animation gesture handler */ }
			<PanGestureHandler onHandlerStateChange={ pan } onGestureEvent={ pan }>

				{ children }

			</PanGestureHandler>

		</TouchableOpacity>

	</TouchableOpacity>

</Portal>

// ///////////////////////////////
//  Menu
// ///////////////////////////////
export const Menu = ( { width, links, toggle, pan, translate, ...props } ) => {

	const theme = useSelector( store => store?.settings?.theme || {} )
	const dispatch = useDispatch()
	const history = useHistory()

	const [ updatesAvailable, setUpdatesAvailable ] = useState( false )
	const [ checkingUpdates, setCheckingUpdates ] = useState( false )
	const [ checkedAt, setCheckedAt ] = useState( undefined )
	const check = async f => {
		setCheckingUpdates( true )
		const available = await updateIfAvailable()
		setUpdatesAvailable( available )
		setCheckingUpdates( false )
		setCheckedAt( `${new Date().getHours()}:${new Date().getMinutes()}` )
	}

	return <Backdrop toggle={ toggle } pan={ pan } width={ width }>
		<Animated.View style={ [ translate, { flex: 1 } ] }>

			{ /* Visual surface element */ }
			<Surface nativeID='navigation-surface' style={ { flex: 1, elevation: 5 } }>
				<SafeAreaView style={ { flex: 1, backgroundColor: theme?.colors?.surface } }>

					{ /* Title */ }
					<View style={ { height: '100%', marginBottom: 0 } }>

						{ /* Elements included from above */ }
						{ links.map( section => <Drawer.Section style={ { } } key={ section.label } title={ section.label }>
							{ section.links.map( ( { label, to, onPress } ) => <Drawer.Item key={ label+to } label={ label } onPress={ onPress ? onPress : f => history.push( to ) } /> ) }
						</Drawer.Section> ) }


						<View style={ { marginTop: 'auto', width: '100%' } }>
							{ /* Version info */ }
							{ checkingUpdates && <Text style={ { opacity: .3, padding: 10, textAlign: 'right' } }>Checking for updates</Text> }
							{ !checkingUpdates && !updatesAvailable && <Text onPress={ check } style={ { opacity: .3, padding: 10, textAlign: 'right' } }>{ version } { updatesAvailable ? '- update available' : '- latest' } { checkedAt && `(checked: ${ checkedAt })` }</Text> }
							{ /* Darkmode toggle */ }
							<DarkMode toggleDark={ f => dispatch( toggleDarkMode() ) } theme={ theme } />
						</View>

					</View>
				</SafeAreaView>
			</Surface>

		</Animated.View>
	</Backdrop>
}