import React from 'react';
import { useSelector } from 'react-redux';
import { Card, Row, Col } from 'antd';
import TrendChart from './TrendChart';


const TrendChartContainer = props => {
  const timeSeries = useSelector(state => state.timeSeries);
  const isLoading = useSelector(state => state.isLoading);
  const { Meta } = Card;

  return (
    <Row justify='space-between'>
      <Col span={8}>
        <Card loading={isLoading}>
          <Meta
            title='Global Cases'
            description={<TrendChart {...timeSeries.Global} />}
          />
        </Card>
      </Col>
      <Col span={8}>
        <Card loading={isLoading}>
          <Meta
            title='China Cases'
            description={<TrendChart {...timeSeries.China} />}
          />
        </Card>
      </Col>
      <Col span={8} className='float-right'>
        <Card loading={isLoading}>
          <Meta
            title='US Cases'
            description={<TrendChart {...timeSeries.US} />}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default TrendChartContainer;
