import React from 'react';
import { Row, Col, Statistic, Card, Carousel } from 'antd';
import { ArrowUpOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import getMsg from '../../utils/getFormattedMessage';
import './CarouselData.scss';

const CarouselData = props => {
  const { Meta } = Card;
  const data = useSelector(state => state.latestUpdate);
  const isLoading = useSelector(state => state.isLoading);
  return (
    <>
        {isLoading
          ? null
          : <Carousel effect='fade' autoplay dotPosition='bottom'>
            {['Worldwide', 'US', 'China', 'Singapore'].map(k => (
              <Card key={`data-card-${k}`}>
                <Meta
                  title={<h1>{getMsg(`area.${k}`)}</h1>}
                  description={
                    <Row>
                      {['confirmed', 'recovered', 'deaths'].map(dk => {
                        return (
                          <Col span={8} className='text-center' key={`data-card-${k}-col-${dk}`}>
                            <Statistic
                              title={<h1>{getMsg(`global.${dk}`)}</h1>}
                              value={data[k][dk]}
                            />
                            <Statistic
                              className={'delta-data'}
                              value={data[k].increment[dk]}
                              valueStyle={{ color: dk === 'recovered' ? '#3f8600' : '#cf1322' }}
                              prefix={<ArrowUpOutlined />}
                            />
                          </Col>
                        );
                      })}
                    </Row>
                  }
                />
              </Card>
            ))}
          </Carousel>
        }
      </>
  );
};

export default CarouselData;
