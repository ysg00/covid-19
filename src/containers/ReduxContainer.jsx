import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import reducer from './../reducer';

export default ({ children }) => (
  <Provider store={createStore(reducer)}>
    {children}
  </Provider>
);
