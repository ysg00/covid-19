import React from 'react';
import { Tooltip, BackTop } from 'antd';
import { getFormattedMessage } from './../../utils/Formatter';

export default props => (
  <Tooltip
    placement='left'
    title={getFormattedMessage('affix.backtotop')}
    mouseEnterDelay={0.5}
  >
    <BackTop />
  </Tooltip>
);