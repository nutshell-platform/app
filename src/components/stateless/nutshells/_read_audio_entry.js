import React, { useState, useEffect, memo } from 'react'
import { View, Avatar, Text, ProgressBar, ActivityIndicator } from '../common/generic'

// Hooks
import { useSelector } from 'react-redux'

// Helper functions
import { catcher, Dialogue, log } from '../../../modules/helpers'
import { Pressable } from 'react-native'
import { isWeb, isIos } from '../../../modules/apis/platform'

// Audio
import { Audio } from 'expo-av'
import { useAssets } from 'expo-asset'
import * as Linking from 'expo-linking'

// Single collapsble entry
export const AudioEntry = memo( ( { audioURI } ) => {

	// //// dev only ////
	// const devEntry = useSelector( store => store?.nutshells?.draft?.audio[0] )
	// audioURI = devEntry
	// //// dev only ////

	// Styling
	const theme = useSelector( store => store?.settings?.theme || {} )
	const iconSize = 30
	const SubScript = ( { children, ...props } ) => <Text { ...props } style={ { fontSize: 10, marginLeft: iconSize * 1.5 } }>{ children }</Text>

	// playback controls
	const [ sound, setSound ] = useState( )
	const [ loadingExisting, setLoadingExisting ] = useState( true )
	const [ isPlaying, setPlaying ] = useState( false )
	const [ playedMillis, setPlayedMillis ] = useState( 0 )
	const [ durationMillis, setDurationMillis ] = useState( 60 )
	const togglePlayback = async f => {

		// Since audio doesn't work on web and ios, open in browser
		if( isWeb || isIos ) {
			await Dialogue( 'Opening in browser', `Audio playback is not yet supported on ${ isWeb ? 'the web interface' : '' }${ isIos ? 'the Android app' : '' }. I'll open the audio in your browser instead.` )
			return Linking.openURL( audioURI )
		}

		try {
			if( isPlaying ) await sound.pauseAsync()
			else await sound.playAsync( )
			setPlaying( !isPlaying )
	} catch( e ) {
		Dialogue( 'Playback error: ', e.message )
		catcher( e )
	}

	}

	// Load audio file
	const [ assets, error ] = useAssets( [ audioURI ] )
	useEffect( f => {

		if( isWeb || isIos ) {
			setLoadingExisting( false )
			setDurationMillis( 60000 ) // Set to one minute (arbitrary)
			return log( 'Not loading audio file, unsupported platform' )
		}

		const [ audioNutshellAsset ] = assets || []
		log( 'Loaded remote asset: ', audioNutshellAsset )

		if( audioNutshellAsset ) Audio.Sound.createAsync( audioNutshellAsset )
		.then( async ( { sound, ...rest } ) => {

			log( 'Loaded sound: ', sound )

			// Set the sound to state
			setSound( sound )

			// Set the metadata of the recording
			await sound.setProgressUpdateIntervalAsync( 100 )
			await sound.getStatusAsync().then( ( { durationMillis } ) => durationMillis && setDurationMillis( durationMillis ) )
			await sound.setOnPlaybackStatusUpdate( async stats => {

				setPlayedMillis( stats.positionMillis )

				// If done playing
				if( stats.positionMillis == durationMillis ) {
					await sound.setStatusAsync( { positionMillis: 0, shouldPlay: false } )
					setPlaying( false )
					setPlayedMillis( 0 )
					
				}
			} )

			// Set the metadata of the recording
			setLoadingExisting( false )

			if( error ) throw error

		} ).catch( e => Dialogue( 'Playback error: ', e.message ) )

		// If the file changed, unload old
		return async f => {
			if( sound ) await sound.unloadAsync()
			setSound( undefined )
		}

	}, [ audioURI, assets ] )

	// Visual variables
	const recordingDuration = Math.floor( durationMillis / 1000 )
	const playedSeconds = Math.floor( playedMillis / 1000 )
	return <View style={ { width: '100%', flexDirection: 'column', alignItems: 'flex-start', padding: 10, backgroundColor: theme?.colors?.divider, marginBottom: 10 } }>

		<Pressable onPress={ togglePlayback } style={ { flex: 1, flexDirection: 'row', width: '100%' } }>
			{ loadingExisting ? <ActivityIndicator size={ iconSize } /> : <Avatar.Icon icon={ isPlaying ? 'pause' : 'play' } size={ iconSize } /> }
			<View style={ { flexGrow: 1, alignSelf: 'center', paddingLeft: iconSize/2 } }>
				<ProgressBar style={ { width: '100%', maxWidth: '100%' } } progress={ playedMillis / durationMillis } color={ theme?.colors?.primary } />
			</View>

		</Pressable>
		
		<View style={ { marginTop: -iconSize/3, width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' } }>
			<SubScript>00:{ playedSeconds < 10 ? `0${ playedSeconds || '0' }` : playedSeconds }</SubScript>
			
			{ /* Total duration */ }
			{ recordingDuration != 60 && <SubScript>00:{ recordingDuration < 10 ? `0${ recordingDuration }` : recordingDuration }</SubScript> }
			{ recordingDuration == 60 && <SubScript>01:00</SubScript> }
		</View>

	</View>

} )