// Routing, using HashRouter instead of BrowserRouter tomake sure no server-side config is needed
import React from 'react'
import { Router }  from 'react-router-dom'
import { createHashHistory } from 'history'

export const History = createHashHistory()

export { Router } from 'react-router-dom'

export { Switch } from 'react-router-dom'

export { Route } from 'react-router-dom'

export { Link } from 'react-router-dom'

export { withRouter } from 'react-router-dom'