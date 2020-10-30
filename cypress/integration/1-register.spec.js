import user from '../fixtures/user'
import { find, fill, click, wait, scroll } from '../fixtures/_helpers'

/// <reference types="cypress" />
context( 'User registration', (  ) => {


	it( 'Register new user user data', () => {

		cy.register( user )

		// Check if default welcome messages are displayed
		find( `Welcome ${ user.name }` )
		find( 'View recommendations' )
		find( 'Edit your nutshell' )

		// Log back out after giving firebase two seconds to think
		wait( 2000 )
		cy.logout()


	} )

	it( 'Logs into the newly created user', () => {

		cy.login( user )

		// Check if default welcome messages are displayed
		find( `Welcome ${ user.name }` )
		find( 'View recommendations' )
		find( 'Edit your nutshell' )

		// Log back out after giving firebase two seconds to think
		wait( 2000 )
		cy.logout()


	} )


} )