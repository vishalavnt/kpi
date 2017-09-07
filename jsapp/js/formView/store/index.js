import { createLogger } from 'redux-logger'
import { combineReducers, applyMiddleware, createStore } from 'redux'
import reducers from '../reducers';

const middleware = [ createLogger() ];

export default createStore(
  reducers,
  // applyMiddleware(...middleware)
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
);
