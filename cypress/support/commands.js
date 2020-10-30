// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
import { find, fill, click, wait, scroll, exclude } from '../fixtures/_helpers'

// ///////////////////////////////
// Spies
// ///////////////////////////////
Cypress.Commands.add( 'awaitinbox', f => {

	// Wait for syncing to start and to stop
	find( 'updating your inbox' )
	exclude( 'updating your inbox' )
	
} )

// ///////////////////////////////
// Authentication
// ///////////////////////////////
Cypress.Commands.add( 'register', user => {

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

	// Wait for syncing to start and to stop
	cy.awaitinbox()

} )

Cypress.Commands.add( 'login', ( user, shouldsucceed=true ) => {

	// Input the relevant data
	fill( 'input#loginreg-email', user.email )
	fill( 'input#loginreg-password', user.password )

	// Trigger registration
	click( '#loginreg-submit', 'login' )

	// Wait for syncing to start and to stop
	if( shouldsucceed ) cy.awaitinbox()

} )

Cypress.Commands.add( 'logout', user => {

	click( '#navigation-toggle' )
	click( '#navigation-surface *', 'Logout' )
	cy.get( 'input#loginreg-email' ).should( 'be.visible' )
	cy.get( 'input#loginreg-password' ).should( 'be.visible' )

} )

// ///////////////////////////////
// Navigation
// ///////////////////////////////
Cypress.Commands.add( 'openSettings', user => {

	click( '#navigation-toggle' )
	click( '#navigation-surface *', 'Settings' )
	cy.get( '#settings-user' ).should( 'be.visible' )
	cy.get( '#settings-contact' ).should( 'be.visible' )
	cy.get( '#settings-account' ).should( 'be.visible' )

} )

Cypress.Commands.add( 'goHome', user => {

	click( '#navigation-home' )
	cy.awaitinbox()

} )
