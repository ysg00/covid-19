import React from 'react';
import { Layout, Row, Col, BackTop } from 'antd';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import reducer from './../reducer';
// import TrendChartContainer from './TrendChart/TrendChartContainer';
import MainData from './MainData/MainData';
import OpenLayerMap from './OpenLayerMap/OpenLayerMap';
import MainContainer from './MainContainer';
import DataTable from './DataTable/DataTable';
import GoogleTrend from './GoogleTrend/GoogleTrend';
import './App.scss';

const App = props => {
  const { Header, Content, Footer } = Layout;
  const store = createStore(reducer);

  return (
    <Provider store={store}>
      <MainContainer id='main-container'>
        <Layout id="app">
          <Header>
            <h1 style={{ color: 'white' }}>Covid-19 Dashboard</h1>
          </Header>
          <Layout>
            <Content style={{
              padding: '0 50px',
            }}>
              <Row justify='center'>
                <Col id="main-content" span={20}>
                  <BackTop />
                  <MainData />
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
          </Layout>
          <Footer>
            <Row>
              <Col offset={2}>
                <span>Data Source</span><br />
                <a href='https://github.com/CSSEGISandData/COVID-19'>https://github.com/CSSEGISandData/COVID-19</a>
              </Col>
            </Row>
          </Footer>
        </Layout>
      </MainContainer>
    </Provider>
  );
};

export default App;
