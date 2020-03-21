import React from 'react';
import { Layout, Row, Col, Statistic, Card, Skeleton, Carousel } from 'antd';
import { ArrowUpOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import './MainData.scss';

const MainData = props => {
  const { Content } = Layout;
  const { Meta } = Card;
  const data = useSelector(state => state.latestUpdate);
  const isLoading = useSelector(state => state.isLoading);
  return (
    <Skeleton loading={isLoading} active>
      <Content className='main-data'>
        {isLoading
          ? null
          : <Carousel effect='fade' autoplay dotPosition='bottom'>
            {['Global', 'US', 'China'].map(k => (
              <Card key={`data-card-${k}`}>
                <Meta
                  title={<h1>{k}</h1>}
                  description={
                    <Row>
                      {['confirmed', 'recovered', 'deaths'].map(dk => {
                        return (
                          <Col span={8} className='text-center' key={`data-card-${k}-col-${dk}`}>
                            <Statistic
                              title={<h1>{dk}</h1>}
                              value={data[k][dk]}
                            />
                            <Statistic
                              value={data[k].increment[dk]}
                              valueStyle={{ color: dk === 'recovered' ? '#3f8600' : '#cf1322' }}
                              prefix={<ArrowUpOutlined style={{bottom: '5px'}}/>}
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
      </Content>
    </Skeleton>
  );
};

export default MainData;
