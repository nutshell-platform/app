service firebase.storage {
  match /b/{bucket}/o {

  	// Disallow all by default
    match /{allPaths=**} {
      allow read, write: if false
    }

    // Allow creation if size is not too big and resource does not exist
    match /avatars/{fileName} {
    	// 5MB max, more that we should ever need
    	allow create: if request.auth != null && request.resource.size < 5 * 1024 * 1024
    	// Read only if logged in
    	allow read: if request.auth != null

    	// Delete only if filename has myUid-uuidAccordingToRFC
    	allow delete: if fileName.matches( request.auth.uid + '(-[a-z0-9]+){5}.jpg' )

    }

  }
}
