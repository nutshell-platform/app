const scrollTo = els => {
	if( els.length ) els[0].scrollIntoView()
	else els.scrollIntoView()
	return els
}

export const find = ( selectorOrText, onlyText, mustbeVisible=false, timeout ) => {

	if( !mustbeVisible ) {
		if( selectorOrText && onlyText ) return cy.contains( selectorOrText, onlyText, { matchCase: false, timeout: timeout } ).then( scrollTo )
		else return cy.contains( selectorOrText, { matchCase: false } ).then( scrollTo )
	} else {
		if( selectorOrText && onlyText ) return cy.contains( selectorOrText, onlyText, { matchCase: false, timeout: timeout } ).then( scrollTo )
		else return cy.contains( selectorOrText, { matchCase: false, timeout: timeout } ).then( scrollTo )
	}

	
}

export const exclude = ( selectorOrText, onlyText ) => {

	if( selectorOrText && onlyText ) return cy.contains( selectorOrText, onlyText, { matchCase: false } ).should( 'not.exist' )
	else return cy.contains( selectorOrText, { matchCase: false } ).should( 'not.exist' )
}

export const fill = ( selector, text ) => cy.get( selector ).then( scrollTo ).clear().type( text, { force: true } ).should( 'have.value', text )

export const click = ( selector, contains, force=false ) => {
	if( contains ) return cy.get( selector ).contains( contains, { matchCase: false } ).then( scrollTo ).click( { force: force } )
	else return cy.get( selector ).then( scrollTo ).click( { force: force } )
}

export const wait = ( ...arg ) => cy.wait( ...arg )

export const scroll = selector => cy.get( selector ).then( scrollTo )
