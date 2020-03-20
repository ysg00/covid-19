import React from 'react';
import { useSelector } from 'react-redux';
import { Card, Row, Col } from 'antd';
import TrendChart from './TrendChart';


const TrendChartContainer = props => {
  const features = useSelector(state => state.features);
  const featureIdx = useSelector(state => state.featureIdx);
  const isLoading = useSelector(state => state.isLoading);
  const { Meta } = Card;
  return (
    <Row justify='space-between'>
      <Col span={8}>
        <Card loading={isLoading}>
          <Meta
            title='Global Case TimeSeries'
            description={<TrendChart {...timeSeries.glob} />}
          />
        </Card>
      </Col>
      <Col span={8}>
        <Card loading={isLoading}>
          <Meta
            title='China Case TimeSeries'
            description={<TrendChart {...timeSeries.c} />}
          />
        </Card>
      </Col>
      <Col span={8} className='float-right'>
        <Card loading={isLoading}>
          <Meta
            title='US Case TimeSeries'
            description={<TrendChart {...timeSeries.us} />}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default TrendChartContainer;
