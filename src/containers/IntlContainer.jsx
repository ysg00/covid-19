import React from 'react';
import { IntlProvider } from 'react-intl';
import { useSelector } from 'react-redux';
import lang from './../lang';

export default ({ children }) => {
  const locale = useSelector(state => state.locale)
  return (
    <IntlProvider locale={locale} messages={lang[locale]}>
      {children}
    </IntlProvider>
  );
};


