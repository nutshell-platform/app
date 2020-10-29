import user from '../fixtures/user'
import { url } from '../fixtures/platform'
import { find, fill, click, wait, scroll } from '../fixtures/_helpers'

/// <reference types="cypress" />
context( 'User registration', (  ) => {

	beforeEach( () => {
		cy.visit( `${ url }/?purge` )
		cy.viewport(1920, 6000)

	} )


	it( 'Register new user user data', () => {

		// Switch to registration view
		click( '#loginreg-toggle', 'register' )

		// Input the relevant data
		fill( 'input#loginreg-name', user.name )
		fill( 'input#loginreg-username', user.handle )
		fill( 'input#loginreg-email', user.email )
		fill( 'input#loginreg-password', user.password )
		click( '#loginreg-toc', 'accept' )

		// Trigger registration
		click( '#loginreg-submit', 'register' )

		// Check if default welcome messages are displayed
		find( `Welcome ${ user.name }` )
		find( 'View recommendations' )
		find( 'Edit your nutshell' )

		// Log back out after giving firebase two seconds to think
		wait( 2000 )
		click( '#navigation-toggle' )
		click( '#navigation-surface *', 'Logout' )


	} )

	it( 'Logs into the newly created user', () => {

		// Input the relevant data
		fill( 'input#loginreg-email', user.email )
		fill( 'input#loginreg-password', user.password )

		// Trigger registration
		click( '#loginreg-submit', 'login' )

		// Check if default welcome messages are displayed
		find( `Welcome ${ user.name }` )
		find( 'View recommendations' )
		find( 'Edit your nutshell' )

		// Log back out after giving firebase two seconds to think
		wait( 2000 )
		click( '#navigation-toggle' )
		click( '#navigation-surface *', 'Logout' )


	} )

	it( 'Deletes the newly created user', () => {

		// Deletion confirmations
		cy.on('window:confirm', f => true )

		// Input the relevant data
		fill( 'input#loginreg-email', user.email )
		fill( 'input#loginreg-password', user.password )

		// Trigger registration
		click( '#loginreg-submit', 'login' )

		// Delete account
		click( '#navigation-toggle' )
		click( '#navigation-surface *', 'Settings' )
		scroll( '#settings-account' )
		click( '#settings-triggerdelete' )
		fill( '#settings-currentpassword', user.password )
		click( '#settings-confirmdelete' )

		// Try to log in with old details
		cy.on('window:alert', response => {
			expect( response.code ).to.equal( 'auth/user-not-found' )
		} )
		fill( 'input#loginreg-email', user.email )
		fill( 'input#loginreg-password', user.password )

		// Trigger registration
		click( '#loginreg-submit', 'login' )

	} )

} )