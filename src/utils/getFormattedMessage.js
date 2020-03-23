import React from 'react';
import { FormattedMessage } from 'react-intl';
import lang from './../lang';

export default (id, values = {}, original = '') => (
  <>
    { lang.en[id]
      ? <FormattedMessage
        id={id}
        defaultMessage={lang.en[id]}
        values={values}
      />
      : original
    }
  </>
);
