import user from '../fixtures/user'
import { find, fill, click, wait, scroll, exclude } from '../fixtures/_helpers'
// set your avatar, update your bio, follow some people, set a comment method
/// <reference types="cypress" />
context( 'Onboarding tutorial', (  ) => {


	it( 'Bio & contact method', () => {

		cy.login( user )

		// Check for onboarding suggestions
		cy.get( '#tutorial' ).should( 'be.visible' )
		find( 'Set a comment method' )
		find( 'Update your bio' ).click()

		cy.get( '#settings-bio' ).should( 'be.visible' )
		find( 'save changes' ).should( 'be.visible' )

		fill( '#settings-bio', user.bio )
		find( 'save changes' ).click()

		cy.goHome()

		cy.get( '#tutorial' ).should( 'be.visible' )
		exclude( 'Update your bio' )
		exclude( 'Set a comment method' )


	} )

	it( 'Follow someone', () => {

		cy.login( user )

		// Check for onboarding suggestions
		cy.get( '#tutorial' ).should( 'be.visible' )
		find( 'follow some people' ).click()

		// Wait for loading to start and end
		find( 'Loading some people. Nice people.' )
		exclude( 'Loading some people. Nice people.' )
		find( 'follow' ).click()

		cy.goHome()

		cy.get( '#tutorial' ).should( 'be.visible' )
		exclude( 'follow some people' )


	} )


} )