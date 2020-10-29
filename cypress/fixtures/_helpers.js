const scrollTo = els => {
	if( els.length ) els[0].scrollIntoView()
	else els.scrollIntoView()
	return els
}

export const find = ( selectorOrText, onlyText ) => {

	if( selectorOrText ) return cy.contains( selectorOrText, onlyText, { matchCase: false } ).then( scrollTo ).should( 'be.visible' )
	else return cy.contains( onlyText, { matchCase: false } ).then( scrollTo ).should( 'be.visible' )
}

export const fill = ( selector, text ) => cy.get( selector ).then( scrollTo ).should( 'be.visible' ).type( text ).should( 'have.value', text )

export const click = ( selector, contains ) => {
	if( contains ) return cy.get( selector ).contains( contains, { matchCase: false } ).then( scrollTo ).should( 'be.visible' ).click(  )
	else return cy.get( selector ).then( scrollTo ).should( 'be.visible' ).click(  )
}

export const wait = ( ...arg ) => cy.wait( ...arg )

export const scroll = selector => cy.get( selector ).then( scrollTo ).should( 'be.visible' )
