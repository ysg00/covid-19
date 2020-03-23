import React from 'react';
import BackToTop from './BackToTop';
import LangSwitch from './LangSwitch';
import RedirectToGithub from './RedirectToGithub';
import './index.scss';

export default props => (
  <>
    <BackToTop />
    <LangSwitch />
    <RedirectToGithub />
  </>
);