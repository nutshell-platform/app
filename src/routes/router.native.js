import React from 'react'
import { NativeRouter } from 'react-router-native'
import { createMemoryHistory } from 'history'

export const History = undefined

export { NativeRouter as Router } from 'react-router-native'

export { Switch } from 'react-router-native'

export { Route } from 'react-router-native'

export { Link } from 'react-router-native'

// Mocked withRouter if we are testing
import { withRouter as realWithRouter } from 'react-router-native'
const mockedWithRouter = componentFunction => f => <componentFunction history={ { push: f => f } } />
export const withRouter = process.env.CI ? mockedWithRouter : realWithRouter