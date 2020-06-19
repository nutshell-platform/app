export const user = {
	followers: [
		"lgoMQ4Jc6LejE0PK1DJ0INsb0Nv2",
		"JyQw2fG1tedgeLeH8ewWp67P1ZG2"
	],
	following: [
		"LeUNwgEMY8cBQlmpyw8LcdUp2Mk1",
		"QW1wyrrjWbZ2GtidATJGSQiBnqb2",
		"9rdF3yoiXZVK2ZAHqygpg1Jbhso1",
		"bHOwM0nKgPNMet0JGMCczdbfIrz2"
	],
	email: "mentor@palokaj.co",
	avatar: {
		path: "avatars/HYmfM9Pkp4S88qJwxuJ1N5q4Igp1-504296be-0e6b-410b-8dc0-852db875afe3.jpg",
		uri: "https://firebasestorage.googleapis.com/v0/b/nutshell-staging-1b98e.appspot.com/o/avatars%2FHYmfM9Pkp4S88qJwxuJ1N5q4Igp1-504296be-0e6b-410b-8dc0-852db875afe3.jpg?alt=media&token=77f72f02-18cd-418e-aeb8-78c218f8802c"
	},
	bio: "My name is mentor!",
	handle: "mentor",
	name: "Mentor Palokaj",
	updated: 1591443602191,
	uid: "HYmfM9Pkp4S88qJwxuJ1N5q4Igp1",
	blocked: [
		"CltKDmWb5IUSoy3OLyoskLf5R4m2"
	],
	muted: [
		"neCWiCm3F71XE9bBHOFN",
		"j7jrKmBOz2JxOHDXaF1J"
	],
	moderator: true,
	admin: true
}

export const inbox = [
  "j7jrKmBOz2JxOHDXaF1J",
  "neCWiCm3F71XE9bBHOFN"
]

export const nutshell = {
	uid: "d85e5aff-1f78-4db8-83be-f8ed0c90adc6",
	owner: "HYmfM9Pkp4S88qJwxuJ1N5q4Igp1",
	created: 1592553569796,
	published: 1592812769795,
	updated: 1592553569796,
	status: 'scheduled',
	entries: [
		{ paragraph: 'Paragraph Derp', title: 'Title Derp', uid: 'a45a9e6a-2431-4537-b108-03ba3ccd455f' },
		{ paragraph: 'Paragraph Derp 2', title: 'Title Derp 2', uid: 'b45a9e6a-2431-4537-b108-03ba3ccd455f' }
	],
	user: { ...user }
}

export const settings = {
	"theme": {
		"dark": false,
		"roundness": 0,
		"colors": {
			"primary": "rgb(0,0,0)",
			"accent": "#03dac4",
			"background": "#f6f6f6",
			"surface": "#ffffff",
			"error": "#B00020",
			"text": "#000000",
			"onBackground": "#000000",
			"onSurface": "#000000",
			"disabled": "rgba(0, 0, 0, 0.26)",
			"placeholder": "rgba(0, 0, 0, 0.54)",
			"backdrop": "rgba(0, 0, 0, 0.5)",
			"notification": "#f50057",
			"divider": "rgba(0,0,0,.1)"
		},
		"fonts": {
			"regular": {
				"fontFamily": "Roboto, \"Helvetica Neue\", Helvetica, Arial, sans-serif",
				"fontWeight": "400"
			},
			"medium": {
				"fontFamily": "Roboto, \"Helvetica Neue\", Helvetica, Arial, sans-serif",
				"fontWeight": "500"
			},
			"light": {
				"fontFamily": "Roboto, \"Helvetica Neue\", Helvetica, Arial, sans-serif",
				"fontWeight": "300"
			},
			"thin": {
				"fontFamily": "Roboto, \"Helvetica Neue\", Helvetica, Arial, sans-serif",
				"fontWeight": "100"
			}
		},
		"animation": {
			"scale": 1
		}
	},
	"notifications": {
		"friendJoined": false,
		"newFollower": true,
		"readReminder": true,
		"writeReminder": true
	},
	"pushTokens": [
		"ExponentPushToken[4KmlslOnJCvvNS3-jHOS5k]",
		"ExponentPushToken[McglDfMOCx8CR3y1gQNtCD]"
	],
	"times": {
		"fridayNoon": 1592560800000,
		"mondayNoon": 1592820000000,
		"sundayNoon": 1592733600000
	}
}

export const store = {
	user: user,
	settings: settings,
	nutshells: {
		draft: nutshell,
		inbox: inbox
	}
}