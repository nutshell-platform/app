import user from '../fixtures/user'
import { url } from '../fixtures/platform'
import { find, fill, click, wait, scroll, exclude } from '../fixtures/_helpers'
// set your avatar, update your bio, follow some people, set a comment method
/// <reference types="cypress" />
context( 'Private accounts tests', (  ) => {


	it( 'Set account to private', () => {

		cy.login( user )

		// Confirm follower creation
		cy.on('window:confirm', f => {
			return true
		} )
		cy.on('window:alert', response => {
			expect( response ).to.equal( 'Success' )
		} )

		// Create test followers
		cy.visit( `${ url }/#/?addMultipleTestFollowers` )
		cy.goHome()

		// Mark private
		click( '#navigation-toggle' )
		click( '#navigation-surface *', 'Settings' )
		find( 'Private account disabled' )
		click( '#settings-private-toggle' )
		
		find( 'save changes' ).click()
		find( 'Private account enabled' )
		


	} )

	it( 'Old followers should show up as requests', (  ) => {

		cy.login( user )

		// Open friend manager
		cy.visit( `${ url }/#/friends/find` )

		// See requests
		find( 'Follow requests' )
		find( 'accept' )
		find( 'ignore' )

	} )

	it( 'A user with a private account shows requests instead of follows', () => {

		cy.login( user )
		cy.visit( `${ url }/#/derpface` )

		find( 'This is a private profile' )
		exclude( 'week' )
		find( 'Request follow' ).click()
		find( 'Cancel follow request' ).click()

	} )

	it( 'Follow requests to a private account show up', () => {

		cy.login( user )

		// Confirm follower creation
		let alerts = 1
		cy.on('window:confirm', f => {
			return true
		} )
		cy.on('window:alert', response => {

			switch( alerts ) {
				case 1:
					expect( response ).to.equal( 'Demo data deletion success' )
				break
				case 2:
					expect( response ).to.equal( 'Follower addition success' )
				break
			}
			
			alerts++

		} )

		cy.visit( `${ url }/#/?deleteMyDemoData` )

		cy.visit( `${ url }/#/friends/find` )
		exclude( 'Follow requests' )
		cy.goHome()
		cy.visit( `${ url }/#/friends/find?addMultipleTestFollowers` )

		// See new requests
		find( 'Follow requests' )
		find( 'accept' )
		find( 'ignore' )



	} )


} )