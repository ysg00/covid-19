import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Statistic, Card, Skeleton, Carousel } from 'antd';
import { batch } from 'react-redux';
import './MainData.scss';

const MainData = props => {
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const { Content } = Layout;
  const { Meta } = Card;
  useEffect(() => {
    const url = 'https://services1.arcgis.com/0MSEUqKaxRlEPj5g/ArcGIS/rest/services/ncov_cases/FeatureServer/2/query?where=1%3D1&outFields=*&f=json';
    fetch(url).then(res => {
      res.json().then(json => {
        if (!json.features) {
          throw new Error('error fetch data');
        }
        let usData = {};
        let cData = {};
        const globData = {
          Confirmed: 0,
          Recovered: 0,
          Deaths: 0,
        };
        for (let i = 0; i < json.features.length; i += 1) {
          if (json.features[i].attributes && json.features[i].attributes.Country_Region === 'US') {
            usData = Object.assign({}, (json.features[i].attributes));
          }
          if (json.features[i].attributes && json.features[i].attributes.Country_Region === 'China') {
            cData = Object.assign({}, (json.features[i].attributes));
          }
          globData.Confirmed += json.features[i].attributes.Confirmed;
          globData.Recovered += json.features[i].attributes.Recovered;
          globData.Deaths += json.features[i].attributes.Deaths;
        }
        batch(() => {
          setData({
            Global: globData,
            China: {
              Confirmed: cData.Confirmed,
              Recovered: cData.Recovered,
              Deaths: cData.Deaths,
            },
            USA: {
              Confirmed: usData.Confirmed,
              Recovered: usData.Recovered,
              Deaths: usData.Deaths,
            }
          });
          setIsLoading(false);
        })
      }).catch(e => {
        console.log(e);
      });
    });
  }, []);

  return (
    <Skeleton loading={isLoading} active>
      <Content className='main-data'>
        <Carousel effect='fade' autoplay dotPosition='bottom'>
          {Object.keys(data).map(k => (
            <Card>
              <Meta
                title={<h1>{k}</h1>}
                description={
                  <Row>
                    {Object.keys(data[k]).map(dk => (
                      <Col span={8} className='text-center'>
                        <Statistic
                          title={<h1>{dk}</h1>}
                          value={data[k][dk]}
                        />
                      </Col>
                    ))}
                  </Row>
                } />
            </Card>
          ))}
        </Carousel>
      </Content>
    </Skeleton>
  );
}

export default MainData;