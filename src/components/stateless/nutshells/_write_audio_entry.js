import React, { useState, memo, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Animated } from 'react-native'

// Visual
import { Pressable } from 'react-native'
import { Card, Input, HelperText, View, Caption, Button, IconButton, Profiler, ToolTip, Avatar, Title, Text, ActivityIndicator } from '../common/generic'

// Data
import { catcher, log, Dialogue } from '../../../modules/helpers'
import { isWeb, isIos } from '../../../modules/apis/platform'
import app from '../../../modules/firebase/app'

// Recording
import useInterval from 'use-interval'
import { Audio } from 'expo-av'
import * as Permissions from 'expo-permissions'

export const AudioEntry = ( { ...props } ) => {

	// Grab audio array ( length max 1 for now )
	const [ existingAudioURI ] = useSelector( store => store?.nutshells?.draft?.audio || [] )

	return  <AudioRecorder existingAudioURI={ existingAudioURI } />

}

export const AudioRecorder = memo( ( { existingAudioURI, ...props } ) => {

	// Permissions
	const [ audioPermission, askPermission, getPermission ] = Permissions.usePermissions( Permissions.AUDIO_RECORDING )

	// Uid of nutshell draft
	const uidOfDraftNutshell = useSelector( store => store?.nutshells?.draft?.uid )

	// Recording variables
	const maxLength = 60
	const [ isRecording, setIsRecording ] = useState( false )
	const [ sound, setSound ] = useState( )
	const [ timeRecorded, setTimeRecorded ] = useState( 0 )

	// If existing sound, load it
	const [ loadingExisting, setLoadingExisting ] = useState( !!existingAudioURI )
	useEffect( f => {
		
		if( existingAudioURI ) Audio.Sound.createAsync( { uri: existingAudioURI } )
		.then( ( { sound, ...rest } ) => {

			// Set the sound to state
			setSound( sound )

			// Set the metadata of the recording
			sound.getStatusAsync().then( ( { durationMillis } ) => setTimeRecorded( Math.floor( durationMillis / 1000 ) ) )
			
		} )
		.catch( e => {
			const [ fm, extension ] = existingAudioURI.match( /(?:\.)(\w*)(?:\?)/ )
			if( !extension ) Dialogue( 'Unsupported audio', 'This is not your fault, some old Nutshell messages have a bug that makes them impossble to play. Sorry about that.' )
			else Dialogue( 'Playback error: ', `${ e.message || e }` )
		} )
		.finally( f => setLoadingExisting( false ) )

		// If the file changed, unload old
		return async f => {
			if( sound ) await sound.unloadAsync()
			setSound( undefined )
		}

	}, [ existingAudioURI ] )

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
			getPermission()
			if( !audioPermission?.granted ) return Dialogue( 'Please give the app audio permissions in order to record' ).finally( askPermission )
			if( isIos ) await Audio.setAudioModeAsync( { allowsRecordingIOS: true, playsInSilentModeIOS: true } )
			
			const { canRecord } = await recorder.getStatusAsync()
			if( !canRecord ) await recorder.prepareToRecordAsync( Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY )

			// Exit if recording stopped
			if( isRecording ) {
				await recorder.stopAndUnloadAsync()
				const { sound } = await recorder.createNewLoadedSoundAsync()
				setSound( sound )
			}

			// Start recording
			if( !isRecording ) {
				
				await recorder.startAsync()
			}

			// Set visual recording state
			setIsRecording( !isRecording )

		} catch( e ) {

			setIsRecording( false )
			catcher( e )
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
			setIsSaved( false )
			if( existingAudioURI ) await app.deleteAudioEntry( uidOfDraftNutshell )

		} catch( e ) {
			catcher( e )
			Dialogue( 'Reset error', e )
		}
	}

	// Saving
	const [ isSaved, setIsSaved ] = useState( !!existingAudioURI )
	const [ isSaving, setIsSaving ] = useState( false )
	const saveRecording = async f => {

		try {

			setIsSaving( true )
			const audioURI = await recorder.getURI( )
			const [ fm, extension ] = audioURI.match( /(?:\.)(\w*$)/ )
			if( !extension ) throw 'Error getting extension'

			// Create file blob for upload
			const file = await fetch( audioURI )
			const audioBlob = await file.blob()

			// If extension valid, add path to avatar, extension is always jpg because of the image manipulator's jpeg output
			await app.saveAudioEntry( uidOfDraftNutshell, audioBlob, extension )
			
			setIsSaved( true )
			setIsSaving( false )

		} catch( e ) {
			catcher( e )
			Dialogue( 'Error saving audio: ', e.message || e )
		}

	}

	if( loadingExisting || isSaving ) return <Card>
		<ActivityIndicator />
	</Card>
	

	return <Card>

			{ /* Recorder */ }
			<Pressable onPress={ loadingExisting ? f => f : toggleRecording } style={ { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' } }>

				
				<RecordIcon isDone={ !isRecording && sound } isRecording={ isRecording } maxedOut={ timeRecorded == maxLength } />

				<View style={ { flexDirection: 'column', height: 50 } }>
					<Title style={ { marginTop: 0 } }>{ loadingExisting ? 'Loading ' : '' }Audio Nutshell</Title>
					{ timeRecorded != 60 && <Text>00:{ timeRecorded < 10 ? `0${timeRecorded}` : timeRecorded }/01:00</Text> }
					{ timeRecorded == 60 && <Text>01:00/01:00</Text> }
				</View>

			</Pressable>

			<RecordingMeta save={ saveRecording } isSaved={ isSaved } sound={ sound } reset={ resetIsRecording } timeRecorded={ timeRecorded } />

	</Card>
} )

const RecordingMeta = memo( ( { sound, reset, save, isSaved } ) => {

	// Show nothing if recording has not started
	if( !sound ) return null

	// Saved audio handling
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