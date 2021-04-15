import user from '../fixtures/user'
import { url } from '../fixtures/platform'
import { find, fill, click, wait, scroll } from '../fixtures/_helpers'

/// <reference types="cypress" />
context( 'User deletion', (  ) => {

	it( 'Deletes the newly created user', () => {

		// Deletion confirmations
		cy.on('window:confirm', f => {
			return true
		} )

		cy.login( user )

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
		cy.login( user, false ) // false means it should not check for logged in status

	} )

} )