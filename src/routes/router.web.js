// Routing, using HashRouter instead of BrowserRouter tomake sure no server-side config is needed
import React from 'react'
import { Router }  from 'react-router-dom'
import { createHashHistory } from 'history'
import { isCI } from '../modules/apis/platform'

export const History = createHashHistory()

export { Router } from 'react-router-dom'

export { Switch } from 'react-router-dom'

export { Route } from 'react-router-dom'

export { Link } from 'react-router-dom'


// Mocked withRouter if we are testing
import { withRouter as realWithRouter } from 'react-router-dom'
const mockedWithRouter = componentFunction => f => <componentFunction history={ { push: f => f } } />
export const withRouter = isCI ? mockedWithRouter : realWithRouter