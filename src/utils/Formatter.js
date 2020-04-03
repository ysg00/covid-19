import React from 'react';
import { FormattedMessage } from 'react-intl';
import lang from './../lang';

export const getCapitalizedString = str => str[0].toUpperCase() + str.slice(1);

export const getFormattedDateYYYYMMDD = date => `${date.getFullYear()}-${date.getMonth() < 9
  ? `0${date.getMonth() + 1}`
  : date.getMonth() + 1}-${date.getDate() <= 10 ? `0${date.getDate()}` : date.getDate()}`;

export const getFormattedDateMMDDYYYY = date => `${date.getMonth() < 9
  ? `0${date.getMonth() + 1}`
  : date.getMonth() + 1}-${date.getDate() <= 10 ? `0${date.getDate()}` : date.getDate()}-${date.getFullYear()}`;

export const getFormattedMessage = (id, values = {}, original = '') => (
  <>
    {lang.en[id]
      ? <FormattedMessage
        id={id}
        defaultMessage={lang.en[id]}
        values={values}
      />
      : original
    }
  </>
);

export const getFormatMessage = (id, locale, original = '') =>
{
  return lang[locale][id]
  ? lang[locale][id]
  : lang['en'][id]
  ? lang['en'][id]
  : original
}
  