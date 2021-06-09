import user from '../fixtures/user'
import { find, fill, click, wait, scroll, exclude } from '../fixtures/_helpers'

/// <reference types="cypress" />
context( 'View profile', (  ) => {


	it( 'Bio & contact method', () => {

		cy.login( user )

		// Open own profile
		cy.openMyProfile()

		// Check if details match what they should based on onboarding test actions
		find( user.bio )
		find( new RegExp( `Following \\d` ) )
		find( `Followers 0` )

		cy.goHome()

	} )

	it( 'View profile of the person I followed', () => {

		cy.login( user )

		// Open friend manager
		cy.openFriendManager()

		// Click the first profile and view it
		click( `#friends-find-search-result-link-0` )

		// Thigns we would expect on a profile
		find( 'Following' )
		find( 'Followers' )
		find( 'Unfollow' )

		cy.goHome()


	} )


} )