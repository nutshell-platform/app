import user from '../fixtures/user'
import nutshell from '../fixtures/nutshell'
import { find, fill, click, wait, scroll, exclude } from '../fixtures/_helpers'

/// <reference types="cypress" />
context( 'Write nutshell', (  ) => {


	it( 'Add entry content', () => {

		cy.login( user )

		// Use navigation header write button
		click( '#navigation-writenutshel' )
		find( `${ user.name }'s Nutshell for` )
		find( 'What is a Nutshell?' )
		cy.goHome()

		// Go home and try the FAB
		click( '[data-testid="fab-toggle"]' )
		find( 'Write Nutshell' ).click()
		find( `${ user.name }'s Nutshell for` )
		find( 'What is a Nutshell?' )

		// Fill in some data for entry one
		fill( '#nutshell-write-entry-0-headline', nutshell.entries[0].headline )
		fill( '#nutshell-write-entry-0-content', nutshell.entries[0].content )
		find( 'Unsaved changes' )
		exclude( 'Unsaved changes' )

		// And entry 2
		fill( '#nutshell-write-entry-1-headline', nutshell.entries[1].headline )
		fill( '#nutshell-write-entry-1-content', nutshell.entries[1].content )
		find( 'Unsaved changes' )
		exclude( 'Unsaved changes' )

		// Shuffle the entries around with the down button
		click( '#nutshell-write-entry-0 [data-testid="menudots"]' )
		click( '[data-testid="nutshell-write-entry-0-movedown"]' )
		cy.get( '#nutshell-write-entry-0-headline' ).should( 'have.value', nutshell.entries[1].headline )
		cy.get( '#nutshell-write-entry-0-content' ).should( 'have.value', nutshell.entries[1].content )

		click( '#nutshell-write-entry-0 [data-testid="menudots"]' )
		click( '[data-testid="nutshell-write-entry-0-movedown"]' )
		cy.get( '#nutshell-write-entry-0-headline' ).should( 'have.value', nutshell.entries[0].headline )
		cy.get( '#nutshell-write-entry-0-content' ).should( 'have.value', nutshell.entries[0].content )

		// Shuffle the entries around with the up button
		click( '#nutshell-write-entry-1 [data-testid="menudots"]' )
		click( '[data-testid="nutshell-write-entry-1-moveup"]' )
		cy.get( '#nutshell-write-entry-1-headline' ).should( 'have.value', nutshell.entries[0].headline )
		cy.get( '#nutshell-write-entry-1-content' ).should( 'have.value', nutshell.entries[0].content )

		click( '#nutshell-write-entry-1 [data-testid="menudots"]' )
		click( '[data-testid="nutshell-write-entry-1-moveup"]' )
		cy.get( '#nutshell-write-entry-1-headline' ).should( 'have.value', nutshell.entries[1].headline )
		cy.get( '#nutshell-write-entry-1-content' ).should( 'have.value', nutshell.entries[1].content )

		cy.goHome()

	} )

	it( 'Set entry status', () => {

		cy.login( user )

		// Use navigation header write button
		click( '#navigation-writenutshel' )
		find( `${ user.name }'s Nutshell for` )
		find( 'What is a Nutshell?' )

		// Toggle the status back and forth
		find( 'Status: scheduled for sun' )
		click( '#nutshell-write-toggle-scheduled' )
		find( 'Draft: will not auto-publish' )
		click( '#nutshell-write-toggle-scheduled' )
		find( 'Status: scheduled for sun' )

		cy.goHome()

	} )


} )