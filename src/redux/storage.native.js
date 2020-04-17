// ///////////////////////////////
//  Expo managed native store
// ///////////////////////////////
import createSecureStore from "redux-persist-expo-securestore"
// Store exceeded?
// import createSecureStore from '@neverdull-agency/expo-unlimited-secure-store'
const store = createSecureStore()
export default store