import { dataFromSnap } from './helpers'
export const createNutshell = ( app, nutshell ) => {

	return app.db.collection( 'nutshells' ).add( {
		...nutshell,
		created: Date.now(),
		updated: Date.now(),
		owner: app.auth.currentUser.uid
	} )

}

export const updateNutshell = ( app, nutshell ) => {

	const { id } = nutshell
	delete nutshell.id

	return app.db.collection( 'nutshells' ).doc( id ).set( {
		...nutshell,
		updated: Date.now(),
	}, { merge: true } )

}

export const listenToLatestNutshell = ( app, dispatch, action ) => {

	app.db.collection( 'nutshells' )
		.where( 'owner', '==', app.auth.currentUser.uid )
		.where( 'status', 'in', [ 'draft', 'scheduled' ] )
		.orderBy( 'updated', 'desc' )
		.limit( 1 ).onSnapshot( doc => {

			// Data from snap returns array limited to one unit
			const [ nutshell ] = dataFromSnap( doc )
			return dispatch( action( nutshell ) )

		} )
}