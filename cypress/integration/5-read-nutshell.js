import user from '../fixtures/user'
import { url } from '../fixtures/platform'
import { find, fill, click, wait, scroll, exclude } from '../fixtures/_helpers'

/// <reference types="cypress" />
context( 'Read nutshell', (  ) => {


	it( 'Create demo nutshell', () => {

		cy.login( user )

		// Create test nutshell
		cy.visit( `${ url }/#/?createDemoNutshell` )
		wait( 6000 )
		cy.goHome()

		// See if the test nutshell is added to the feed
		find( 'test 1', undefined, false, 60000 ) // Long timeout for sync of func result
		find( 'test 2' )

		// See if the content showed up
		find( 'test 1' ).click()
		find( 'test 2' ).click()
		find( 'content 1' )
		find( 'content 2' )

	} )

	it( 'Menu works', () => {

		cy.login( user )

		// Click first menu and check if all options are there
		click( '#nutshell-card-0 [data-testid="menudots"]' )
		find( 'report abuse' )
		find( 'block & unfollow this user' )
		find( 'mute this nutshell' )

	} )

	it( 'Archive demo nutshell', () => {

		cy.login( user )

		// See if the test nutshell is added to the feed
		find( 'test 1' )
		find( 'test 2' )

		// Archive the created nutshell
		find( 'archive' ).click()
		exclude( 'test 1' )
		exclude( 'test 2' )

	} )



} )