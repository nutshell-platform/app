const functions = require('firebase-functions')
const { appid, adminkey, searchkey, accountindex } = functions.config().algolia || {}
const { dataFromSnap, log, error } = require( './helpers' )
const algolia = require( 'algoliasearch' )
const { db } = require( './firebase' )


const client = algolia( appid, adminkey )
const indexes = {
	account: client.initIndex( accountindex )
}

const saveAccountEntry = entry => {
	const index = client.initIndex( accountindex )
	return index.saveObject( entry )
}

exports.updateAlgoliaAccountOnWrite = ( change, context ) => saveAccountEntry( {
	...change.after.data(),
	objectID: context.params.uid
} )

exports.updateAllAlgoliaAccountEntries = async userUid => {

	log( 'Sending all account data to algolia' )

	try {

		const { admin } = await db.collection( 'specialPowers' ).doc( userUid ).get().then( dataFromSnap )

		if( !admin ) throw `User ${ userUid } is not an admin`
		
		let accounts = await db.collection( 'users' ).get().then( dataFromSnap ) || []

		log( `Found ${ accounts.length } entries to sent to algolia` )

		accounts = accounts.map( ( { uid, ...account } ) => ( { objectID: uid, ...account } ) )
		return indexes.account.saveObjects( accounts )
		
	} catch( e ) {
		error( 'updateAllAlgoliaAccountEntries error: ', e )
	} finally {
		log( 'Algolia import complete' )
	}

}

exports.searchAlgoliaAccountEntries = ( query, context ) => indexes.account.search( query )