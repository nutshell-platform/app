module.exports = {

    // Recommended features
    "extends": [ "eslint:recommended", "plugin:react/recommended" ],

    //Parser features
    parser: "@babel/eslint-parser",
    parserOptions: {
        requireConfigFile: false,
        ecmaVersion: 12,
        sourceType: "module",
        ecmaFeatures: {
            jsx: true,
            experimentalObjectRestSpread: true
        }
    },

    // Specific rules, 2: err, 1: warn, 0: off
    rules: {

        "no-case-declarations": 0,
        "prefer-arrow-callback": 2,
        "no-mixed-spaces-and-tabs": 1,
        "no-unused-vars": [ 1, { vars: 'all', args: 'none' } ], // All variables, no function arguments

        // React specific
        "react/prop-types": 0,
        "react/display-name": 0
    },

    // What environment to run in
    env:{
        node: true,
        browser: true,
        mocha: true,
        jest: true,
        es6: true
    },

    // What global variables should be assumed to exist
    globals: {
        context: false,
        cy: true,
        // window: true,
        // location: true,
        // fetch: true
    },

    // Plugins
    plugins: [ "react" ]
}