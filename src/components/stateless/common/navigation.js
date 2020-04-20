import React from 'react'

// Visual
import { TouchableOpacity, View, Animated, SafeAreaView, Dimensions } from 'react-native'
import { Drawer, Portal, Appbar, withTheme, Surface, Text, StatusBar, Toggle } from './generic'
import { PanGestureHandler } from 'react-native-gesture-handler'
const screenHeight = Math.round(Dimensions.get('window').height)

// ///////////////////////////////
// Header
// ///////////////////////////////
export const Header = ( { style, back, title, subtitle, toggle, pan, drawer, drawerWidth, drawerTranslate, toggleDark, children, links, go } ) => <View style={ { width: '100%' } }>
	<StatusBar />
	<Appbar.Header style={ { width: '100%', paddingVertical: 30, ...( !back && { paddingLeft: 20 } ), ...style } } statusBarHeight={ 0 }>
		{ back && <Appbar.BackAction onPress={ back } /> }
		<Appbar.Content title={ title } subtitle={ subtitle }/>
		{ children }
		<Appbar.Action icon="menu" onPress={ toggle } />
	</Appbar.Header>
	{ drawer && <Menu links={ links } go={ go } toggleDark={ toggleDark } translate={ drawerTranslate } width={ drawerWidth } pan={ pan } toggle={ toggle } /> }
</View>

// ///////////////////////////////
// Sidebar
// ///////////////////////////////
const DarkMode = ( { toggleDark, theme } ) => <View style={ { flexDirection: 'row', marginTop: 'auto', paddingHorizontal: 40, paddingVertical: 20, borderTopWidth: 1, borderTopColor: theme.colors.divider } }>
	<Toggle label='Dark mode' onToggle={ toggleDark } value={ theme.dark } />
</View>

export const Menu = withTheme( ( { width, links, go, theme, toggle, pan, translate, toggleDark, ...props } ) => <Portal style={ { alignItems: 'center', justifyContent: 'center' } }>

	{  /* Touchable backdrop that closes the sidebar */ }
	<TouchableOpacity activeOpacity={ 1 } onPress={ toggle } style={ { flex: 1 } }>

		{ /* The actual sidebar */ }
		<TouchableOpacity activeOpacity={ 1 } style={ { height: screenHeight, width: width, maxWidth: '100%', alignSelf: 'flex-end' } }>

			{ /* Animation gesture handler */ }
			<PanGestureHandler onHandlerStateChange={ pan } onGestureEvent={ pan }>

				<Animated.View style={ [ translate, { flex: 1 } ] }>

					{ /* Visual surface element */ }
					<Surface elevation={ 1 } style={ { flex: 1 } }>
						<SafeAreaView style={ { flex: 1, backgroundColor: theme.colors.surface } }>

							{ /* Title */ }
							<Drawer.Section title='Menu' style={ { height: '100%', marginBottom: 0 } }>
							
								{ /* Elements included from above */ }
								{ links.map( ( { label, to, onPress } ) => <Drawer.Item key={ label+to } label={ label } onPress={ onPress ? onPress : f => go( to ) } /> ) }

								{ /* Darkmode toggle */ }
							    <DarkMode toggleDark={ toggleDark } theme={ theme } />

						    </Drawer.Section>
					    </SafeAreaView>
					</Surface>
				

				</Animated.View>
				
			</PanGestureHandler>

		</TouchableOpacity>
		
	</TouchableOpacity>	
	
</Portal> )
