const random = ( length=10 ) => `${ Math.round( Math.random() * ( 10 ** length ) ) }`


module.exports = {
	uid: `${ random() }-${ random() }-${ random() }-${ random() }`,
	entries: [
		{ headline: "I'M SO EXCITED!!!11", content: "And I just can't hide it" },
		{ headline: "I am NEVER going to", content: "Give you up" }
	]
}