import React from 'react';
import { Tooltip, BackTop } from 'antd';
import getMsg from './../../utils/getFormattedMessage';

export default props => (
  <Tooltip
    placement='left'
    title={getMsg('affix.backtotop')}
    mouseEnterDelay={0.5}
  >
    <BackTop />
  </Tooltip>
);