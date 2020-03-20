import React from 'react';
import { Layout, Row, Col, Statistic, Card, Skeleton, Carousel } from 'antd';
import { useSelector } from 'react-redux';
import './MainData.scss';

const MainData = props => {
  const { Content } = Layout;
  const { Meta } = Card;
  const data = useSelector(state => state.lastUpdateData);
  const isLoading = useSelector(state => state.isLoading);

  return (
    <Skeleton loading={isLoading} active>
      <Content className='main-data'>
        <Carousel effect='fade' autoplay dotPosition='bottom'>
          {Object.keys(data).map(k => (
            <Card key={`data-card-${k}`}>
              <Meta
                title={<h1>{k}</h1>}
                description={
                  <Row>
                    {Object.keys(data[k]).map(dk => {
                      if (dk !== 'lastUpdate') {
                        return (
                          <Col span={8} className='text-center' key={`data-card-${k}-col-${dk}`}>
                            <Statistic
                              title={<h1>{dk}</h1>}
                              value={data[k][dk]}
                            />
                          </Col>
                        );
                      }
                    })}
                  </Row>
                }
              />
            </Card>
          ))}
        </Carousel>
      </Content>
    </Skeleton>
  );
};

export default MainData;