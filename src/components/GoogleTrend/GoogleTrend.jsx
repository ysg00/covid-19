import React, { useState, useEffect } from 'react';
import { Card, Select, Row, Col } from 'antd';
import { useSelector } from 'react-redux';
import * as clist from 'country-list';
import lodash from 'lodash';
import Script from 'react-load-script';

const GoogleTrend = props => {
  const { Meta } = Card;
  const { Option } = Select;
  const isLoading = useSelector(state => state.isLoading);
  const [searchTime, setSearchTime] = useState('now 7-d');
  const [searchArea, setSearchArea] = useState('now 7-d');

  const handleScriptLoad = ({ type, time, target, geo }) => {
    const keyword = 'Corona Virus';
    window.trends.embed.renderExploreWidgetTo(
      document.getElementById(target),
      type,
      {
        comparisonItem: geo ? [{ keyword, geo: geo.toUpperCase(), time }] : [{ keyword, time }],
        category: 0,
        property: ''
      },
      {
        exploreQuery: geo
          ? `q=${encodeURI(keyword)}&geo=${geo.toUpperCase()}&date=${time}`
          : `q=${encodeURI(keyword)}&date=${time}`,
        guestPath: 'https://trends.google.com:443/trends/embed/'
      }
    );
  };

  useEffect(() => {
    if (!isLoading) {
      const currentGtTimeSeries = document.getElementById('gt-time-series').children[0];
      currentGtTimeSeries.parentNode.removeChild(currentGtTimeSeries);
      const currentGtGeoMap = document.getElementById('gt-geo-map').children[0];
      currentGtGeoMap.parentNode.removeChild(currentGtGeoMap);
      handleScriptLoad({
        type: 'TIMESERIES',
        keyword: 'Corona Virus',
        target: 'gt-time-series',
        time: searchTime,
        geo: searchArea,
      });
      handleScriptLoad({
        type: 'GEO_MAP',
        target: 'gt-geo-map',
        time: searchTime,
        geo: searchArea,
      });
    }
  }, [searchTime, searchArea]);

  return (
    <Card className='gt-card' loading={isLoading}>
      <Meta
        title={
          <Row>
            <Col span={3}>
              <Select
                showSearch
                defaultValue='worldwide'
                bordered={false}
                style={{
                  width: '100%',
                }}
                onChange={v => setSearchArea(clist.getNameList()[v])}
              >
                <Option key='worldwide' value='worldwide'>Worldwide</Option>
                {Object.keys(clist.getNameList()).sort().map(k => 
                  <Option key={k} value={k}>{lodash.capitalize(k)}</Option>
                )}
              </Select>
            </Col>
            <Col span={3}>
              <Select
                defaultValue='now 7-d'
                bordered={false}
                style={{
                  width: '100%',
                }}
                onChange={v => setSearchTime(v)}
              >
                <Option value='now 1-H'>Past Hour</Option>
                <Option value='now 4-H'>Past 4 Hours</Option>
                <Option value='now 1-d'>Past Day</Option>
                <Option value='now 7-d'>Past Week</Option>
                <Option value='today 1-m'>Past Month</Option>
                <Option value='today 3-m'>Past 3 Months</Option>
                <Option value='today 2-m'>Past Year</Option>
              </Select>
            </Col>
          </Row>
        }
        description={
          <Row>
            <Col id='gt-time-series' span={12}>
              <Script
                url='https://ssl.gstatic.com/trends_nrtr/2051_RC11/embed_loader.js'
                onLoad={() => handleScriptLoad({
                  type: 'TIMESERIES',
                  keyword: 'Corona Virus',
                  target: 'gt-time-series',
                  time: searchTime,
                })}
              />
            </Col>
            <Col id='gt-geo-map' span={12}>
              <Script
                url='https://ssl.gstatic.com/trends_nrtr/2051_RC11/embed_loader.js'
                onLoad={() => handleScriptLoad({
                  type: 'GEO_MAP',
                  target: 'gt-geo-map',
                  time: searchTime,
                })}
              />
            </Col>
          </Row>
        }
      />
    </Card>
  );
}

export default GoogleTrend;
