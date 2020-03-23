import React from 'react';
import { Layout, Row, Col } from 'antd';
import MainContainer from './containers';
import CarouselData from './components/CarouselData/CarouselData';
import OpenLayerMap from './components/OpenLayerMap/OpenLayerMap';
import DataTable from './components/DataTable/DataTable';
import GoogleTrend from './components/GoogleTrend/GoogleTrend';
import Affixes from './components/Affixes';
import getMsg from './utils/getFormattedMessage';
import './App.scss';

const App = props => {
  const { Header, Content, Footer } = Layout;
  return (
    <MainContainer>
      <Layout id='app'>
        <Header>
          <h1 style={{ color: 'white' }}>Covid-19</h1>
        </Header>
        <Content style={{ padding: '0 50px' }}>
          <Row justify='center'>
            <Col id='main-content' span={20}>
              <CarouselData />
              <OpenLayerMap />
              <Row>
                <Col span={18}>
                  <DataTable />
                </Col>
                <Col span={6}>
                  <GoogleTrend />
                </Col>
              </Row>
            </Col>
          </Row>
        </Content>
        <Footer>
          <Row>
            <Col offset={2}>
              {getMsg('app.footer.datasource')}
              <br />
              <a href='https://github.com/CSSEGISandData/COVID-19'>https://github.com/CSSEGISandData/COVID-19</a>
            </Col>
          </Row>
        </Footer>
        <Affixes />
      </Layout>
    </MainContainer>
  );
};

export default App;
