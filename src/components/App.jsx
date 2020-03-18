import React from 'react';
import { Layout, Row, Col, Result, Button  } from 'antd';
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom'
import reducer from './../reducer';
import MainContainer from './MainContainer';
import TrendChartContainer from './TrendChart/TrendChartContainer';
import MainData from './MainData/MainData';
import HeatMap from './HeatMap/HeatMap';
import './App.scss';

const App = props => {
  const { Header, Content, Sider, Footer } = Layout;
  const store = createStore(reducer)
  const app = (
    <Layout id="app">
      <Header>
        <h1 style={{color: 'white'}}>Covid-19 Dashboard</h1>
      </Header>
      <Layout>
        <Content style={{
          padding: '0 50px',
        }}>
          <Row justify='center'>
            <Col id="main-content" span={20}>
              <MainData />
              <HeatMap />
              <TrendChartContainer />
            </Col>
          </Row>
        </Content>
      </Layout>
      <Footer>
        Footer
      </Footer>
    </Layout>
  );
  return (
    <Provider store={store}>
      <Router>
        <Switch>
          <Route exact path='/' component={() => app} />
          <Route component={() => (
            <Result
              status="404"
              title="404"
              subTitle="Sorry, the page you visited does not exist."
              extra={
                <Link to='/'>
                  <Button type="primary">Back Home</Button>
                </Link>
              }
            />
          )}/>
        </Switch>
      </Router>
    </Provider>
  );
}

export default App;
