import React from 'react'

// Visual
import { Component, Container, Loading, Main } from '../../stateless/common/generic'
import { Editor } from '../../stateless/nutshells/write'
import Navigation from '../common/navigation'

// Data
import { log, getuuid } from '../../../modules/helpers'
import app from '../../../modules/firebase/app'

// Redux
import { connect } from 'react-redux'

class WriteNutshell extends Component {

	// initialise state
	constructor( props ) {

		super( props )

		this.state = {
			loading: false,
			nutshell: {
				scheduled: false,
				entries: []
			}
		}

	}

	componentDidMount = async f => {

		// Get entries from nutshell and postpend a new one
		const { nutshell } = this.state
		const entries = [ ...nutshell.entries ]

		// Add empty entry to the list
		entries.push( { uuid: await getuuid(), title: '', paragraph: '' } )

		return this.updateState( { nutshell: { ...nutshell, entries: entries } } )
	}

	// Input handler
	onInput = ( key, value ) => this.updateState( { [key]: value } )

	// Entry updates
	updateEntry = async ( uuid, key, value ) => {

		const { nutshell } = this.state
		const { entries } = nutshell

		// Find the entry that needs to be updated and add changes
		const updatedEntry = entries.find( entry => entry.uuid == uuid )
		updatedEntry[ key ] = value
		updatedEntry.updated = Date.now()
		const updatedEntries = [ ...entries ].map( entry => entry.uuid == uuid ? updatedEntry : entry )

		// Check if the last entry is empty, if not add a new one
		const lastEntry = updatedEntries[ updatedEntries.length - 1 ]
		if( lastEntry.title?.length || lastEntry.paragraph?.length ) updatedEntries.push( { uuid: await getuuid(), title: '', paragraph: '' } )

		// Check if the last two are ampty, if so remove one
		const secondLastEntry = updatedEntries.length > 1 && updatedEntries[ updatedEntries.length - 2 ]
		// If both last and second last are empty, remove last
		if( !lastEntry.title?.length && !lastEntry.paragraph?.length && secondLastEntry && !secondLastEntry.title?.length && !secondLastEntry.paragraph?.length ) updatedEntries.pop()

		return this.updateState( { nutshell: { ...nutshell, entries: [ ...updatedEntries ] } } )
	}

	render() {

		const { loading, nutshell } = this.state
		const { history, user } = this.props

		if( loading ) return <Loading message={ loading } />

		return <Container>
			<Navigation title='Write your nutshell' />
			<Main.Center>
				<Editor user={ user } scheduled={ nutshell.status } entries={ nutshell.entries } updateEntry={ this.updateEntry } />
			</Main.Center>
		</Container>

	}

}

export default connect( store => ( {
	user: store.user
} ) )( WriteNutshell )