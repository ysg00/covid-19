import React from 'react';
import ReduxContainer from './ReduxContainer';
import IntlContainer from './IntlContainer';
import LoadingContainer from './LoadingContainer';

export default ({ children }) => (
    <ReduxContainer>
      <IntlContainer>
        <LoadingContainer>
          {children}
        </LoadingContainer>
      </IntlContainer>
    </ReduxContainer>
  );
