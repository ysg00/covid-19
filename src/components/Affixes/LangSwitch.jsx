import React from 'react';
import { Affix, Tooltip, Button, Row, Col } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import getMsg from './../../utils/getFormattedMessage';

export default props => {
  const dispatch = useDispatch();
  const locale = useSelector(state => state.locale);

  return (
    <Affix offsetBottom={148}>
      <Row>
        <Col className='affix-col' span={24}>
          <Tooltip
            placement='left'
            title={getMsg('affix.lang')}
            mouseEnterDelay={0.5}
          >
            <Button
              className='affix-btn-lang'
              shape='circle'
              onClick={() => {
                locale === 'en'
                ? dispatch({ type: 'SET_LOCALE', locale: 'zh' })
                : dispatch({ type: 'SET_LOCALE', locale: 'en' });
                document.activeElement.blur();
              }}
            >
              <b>{locale === 'en' ? '中' : 'En'}</b>
            </Button>
          </Tooltip>
        </Col>
      </Row>
    </Affix>
  );
};
