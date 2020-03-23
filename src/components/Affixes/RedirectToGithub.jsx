import React from 'react';
import { Affix, Tooltip, Button, Row, Col } from 'antd';
import { GithubOutlined } from '@ant-design/icons';
import getMsg from './../../utils/getFormattedMessage';

export default props => {
  return (
    <Affix offsetBottom={100}>
      <Row>
        <Col className='affix-col' span={24}>
          <Tooltip
            placement='left'
            title={getMsg('affix.github')}
            mouseEnterDelay={0.5}
          >
            <Button
              className='affix-btn-github'
              shape='circle'
              href='https://github.com/ysg00/covid-19'
            >
              <GithubOutlined height={24} width={24} />
            </Button>
          </Tooltip>
        </Col>
      </Row>
    </Affix>
  );
};
