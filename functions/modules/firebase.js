// Dependencies
const admin = require('firebase-admin')

// Admin api
const app = admin.initializeApp()
const db = app.firestore()
const { FieldValue } = admin.firestore

module.exports = {
	db: db,
	FieldValue: FieldValue
}