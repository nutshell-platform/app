import React, { useState, memo, useRef, useEffect } from 'react'
import { Animated } from 'react-native'

// Visual
import { Pressable } from 'react-native'
import { Card, Input, HelperText, View, Caption, IconButton, Profiler, ToolTip, Avatar, Title, Text } from '../common/generic'

// Data
import { log } from '../../../modules/helpers'

// Recording
import useInterval from 'use-interval'


export const UnoptimisedAudioEntry = ( { ...props } ) => {

	// Recording
	const maxLength = 60
	const [ recording, setRecording ] = useState( false )
	const [ timeRecorded, setTimeRecorded ] = useState( 0 )
	const toggleRecording = f => {
		if( timeRecorded == maxLength ) return
		if( recording ) blinker.reset()
		else blinker.start()
		setRecording( !recording )
	}
	useInterval( f => {
		if( recording && timeRecorded == maxLength ) {
			blinker.reset()
			return setRecording( false )
		}
		if( recording ) setTimeRecorded( timeRecorded + 1 )
	}, 1000 )

	// Blinker animation
	const blinkColor = useRef( new Animated.Value( 0 ) ).current
	const blinker = Animated.loop( Animated.sequence( [
		Animated.timing( blinkColor, { toValue: 1, duration: 1000 } ),
		Animated.timing( blinkColor, { toValue: 0, duration: 1000 } )
	] ) )
	const currentColor = blinkColor.interpolate( { inputRange: [ 0, 1 ], outputRange: [ 'rgb( 255,255,255 )', 'rgb( 255,0,0 )' ] } )

	// Icon handler
	let icon = recording ? "record" : "microphone"
	if( !recording && timeRecorded ) icon = "pause"
	if( !recording && timeRecorded == maxLength ) icon = "check"

	return <Card>

			<Pressable onPress={ toggleRecording } style={ { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' } }>

				<Animated.View style={ { padding: 2, marginRight: 20, borderRadius: '50%', backgroundColor: currentColor, alignItems: 'center', justifyContent: 'center' } }>
					<Avatar.Icon color={ recording ? 'red' : 'white' } icon={ icon } size={ 50 }/>
				</Animated.View>

				<View style={ { flexDirection: 'column', height: 50 } }>
					<Title style={ { marginTop: 0 } }>Audio Nutshell</Title>
					{ timeRecorded != 60 && <Text>00:{ timeRecorded < 10 ? `0${timeRecorded}` : timeRecorded }/01:00</Text> }
					{ timeRecorded == 60 && <Text>01:00/01:00</Text> }
				</View>
				

			</Pressable>

	</Card>
}

export const AudioEntry = memo( UnoptimisedAudioEntry )