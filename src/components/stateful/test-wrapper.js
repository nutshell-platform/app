import React from 'react'

// Redux mocking
import { History, Router } from '../../routes/router'
import { Provider as PaperProvider } from 'react-native-paper'
import { Provider } from "react-redux"
import configureMockStore from "redux-mock-store"
import { store as dummyStore, settings } from '../../modules/dummy-data'
const mockStore = configureMockStore()
const store = mockStore( dummyStore )

const Wrapper = ( { children, ...props } ) => <Provider store={ store }>
	<Router history={ History }>
		<PaperProvider theme={ settings.theme }>
			{ children }
		</PaperProvider>
	</Router>
</Provider>

export default Wrapper