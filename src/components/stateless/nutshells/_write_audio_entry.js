import React, { useState, memo, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Animated } from 'react-native'

// Visual
import { Pressable } from 'react-native'
import { Card, Input, HelperText, View, Caption, Button, IconButton, Profiler, ToolTip, Avatar, Title, Text } from '../common/generic'

// Data
import { catcher, log, Dialogue } from '../../../modules/helpers'
import { isWeb } from '../../../modules/apis/platform'

// Recording
import useInterval from 'use-interval'
import { Audio } from 'expo-av'
import * as Permissions from 'expo-permissions'

export const UnoptimisedAudioEntry = ( { ...props } ) => {

	// Permissions
	const [ audioPermission, askPermission ] = Permissions.usePermissions( Permissions.AUDIO_RECORDING )

	// Recording variables
	const maxLength = 60
	const [ isRecording, setIsRecording ] = useState( false )
	const [ sound, setSound ] = useState( undefined )
	const [ timeRecorded, setTimeRecorded ] = useState( 0 )

	// Incrementor
	useInterval( async f => {

		// If max length achieved, stop recodring
		if( isRecording && timeRecorded == maxLength ) {
			await recorder.stopAndUnloadAsync()
			return setIsRecording( false )
		}
		if( isRecording ) setTimeRecorded( timeRecorded + 1 )

	}, 1000 )

	// Recording controller
	const [ recorder, setRecorder ] = useState( new Audio.Recording() )
	const toggleRecording = async f => {

		if( isWeb ) return Dialogue( 'No web support yet', 'Please use the app to record audio messages.' )

		if( sound ) return Dialogue( 'You already recorded a Nutshell', 'Please discard the old one by clcking the trash icon if you want to re-record.' )
		
		try {

			// Prep for recording
			if( !audioPermission ) askPermission()
			const { canRecord } = await recorder.getStatusAsync()
			if( !canRecord ) await recorder.prepareToRecordAsync( Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY )

			// Exit if recording stopped
			if( isRecording ) {
				await recorder.stopAndUnloadAsync()
				const { sound } = await recorder.createNewLoadedSoundAsync()
				setSound( sound )
			}

			// Start recording
			if( !isRecording ) await recorder.startAsync()

			// Set visual recording state
			setIsRecording( !isRecording )

		} catch( e ) {

			setIsRecording( false )
			log( e )
			Dialogue( 'Recording error', e.message )

		}

	}


	const resetIsRecording = async f => {
		try {

			await recorder.stopAndUnloadAsync().catch( f => f )
			setRecorder( new Audio.Recording() )
			setSound( undefined )
			setTimeRecorded( 0 )
			setIsRecording( false )

		} catch( e ) {
			catcher( e )
			Dialogue( 'Reset error', e )
		}
	}
	

	return <Card>

			{ /* Recorder */ }
			<Pressable onPress={ toggleRecording } style={ { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' } }>

				
				<RecordIcon isDone={ !isRecording && sound } isRecording={ isRecording } maxedOut={ timeRecorded == maxLength } />

				<View style={ { flexDirection: 'column', height: 50 } }>
					<Title style={ { marginTop: 0 } }>Audio Nutshell</Title>
					{ timeRecorded != 60 && <Text>00:{ timeRecorded < 10 ? `0${timeRecorded}` : timeRecorded }/01:00</Text> }
					{ timeRecorded == 60 && <Text>01:00/01:00</Text> }
				</View>

			</Pressable>

			<RecordingMeta sound={ sound } reset={ resetIsRecording } timeRecorded={ timeRecorded } />

	</Card>
}

const RecordingMeta = memo( ( { sound, reset } ) => {

	// Show nothing if recording has not started
	if( !sound ) return null

	// Saved audio handling
	const [ isSaved, setIsSaved ] = useState( false )
	const [ isPlaying, setIsPlaying ] = useState( false )

	// Set auto-stop in interface based on playbeck
	useEffect( f => {
		if( sound ) sound.setOnPlaybackStatusUpdate( ( { didJustFinish } ) => {
			if( didJustFinish ) setIsPlaying( false )
		} )
	}, [ sound ] )

	// Previewing
	const togglePreview = f => {

		try {

			// Control playback
			if( isPlaying ) sound.stopAsync()
			else sound.setStatusAsync( { shouldPlay: true, positionMillis: 0 } )
			
			// Set interface
			setIsPlaying( !isPlaying )

		} catch( e ) {
			Dialogue( 'Playback error', e.message )
		}

	}

	const save = f => setIsSaved( true )

	return <View style={ { flex: 1, flexDirection: 'column' } }>
		<View style={ { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1 } }>
			<Button style={ { marginTop: 10 } } color={ isSaved ? 'green' : 'orange' } onPress={ save } icon='content-save' />
			<Button style={ { marginTop: 10 } } onPress={ togglePreview } icon={ isPlaying ? 'stop' : 'play' } />
			<Button style={ { marginTop: 10 } } onPress={ reset } icon='delete' />
		</View>
		
		<HelperText style={ {  textAlign: 'center', width: '100%', color: isSaved ? 'green' : 'orange', paddingBottom: 0, marginBottom: -10 } }>{ isSaved ? '' : 'Un' }saved nutshell</HelperText>

	</View>

} )

const RecordIcon = memo( ( { isRecording=false } ) => {

	// Icon handler
	const icon = isRecording ? "record" : "microphone"

	// Blinker animation
	const blinkerSpeed = 1000
	const blinkColor = useRef( new Animated.Value( 0 ) ).current
	const blinker = Animated.loop( Animated.sequence( [
		Animated.timing( blinkColor, { useNativeDriver: false, toValue: 1, duration: blinkerSpeed / 2 } ),
		Animated.timing( blinkColor, { useNativeDriver: false, toValue: 0, duration: blinkerSpeed / 2 } )
	] ) )
	const currentColor = blinkColor.interpolate( { inputRange: [ 0, 1 ], outputRange: [ 'rgb( 255,255,255 )', 'rgb( 255,0,0 )' ] } )


	useEffect( f => {
		if( isRecording ) blinker.start()
		return blinker.reset
	}, [ isRecording ] )


	return <Animated.View style={ { padding: 2, marginRight: 20, borderRadius: 50, backgroundColor: currentColor, alignItems: 'center', justifyContent: 'center' } }>
		<Avatar.Icon color={ isRecording ? 'red' : 'white' } icon={ icon } size={ 50 }/>
	</Animated.View>
} )

export const AudioEntry = memo( UnoptimisedAudioEntry )