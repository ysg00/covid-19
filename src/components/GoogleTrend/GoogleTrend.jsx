import React, { useState, useEffect } from 'react';
import { Card, Select, Row, Col } from 'antd';
import { useSelector } from 'react-redux';
import * as clist from 'country-list';
import Script from 'react-load-script';
import { getFormattedMessage, getCapitalizedString } from './../../utils/Formatter';

const GoogleTrend = props => {
  const { Meta } = Card;
  const { Option } = Select;
  const isLoading = useSelector(state => state.isLoading);
  const [searchTime, setSearchTime] = useState('now 7-d');
  const [searchArea, setSearchArea] = useState('');

  const handleScriptLoad = ({ type, time, target, geo }) => {
    const keyword = 'Corona Virus';
    let query = `q=${encodeURI(keyword)}`;
    if (geo) {
      query += `&geo=${geo.toUpperCase()}`
    }
    query += `&date=${time}`;
    window.trends.embed.renderExploreWidgetTo(
      document.getElementById(target),
      type,
      {
        comparisonItem: geo ? [{ keyword, geo: geo.toUpperCase(), time }] : [{ keyword, time }],
        category: 0,
        property: ''
      },
      {
        exploreQuery: query,
        guestPath: 'https://trends.google.com:443/trends/embed/'
      }
    );
  };

  useEffect(() => {
    if (!isLoading) {
      const gtTimeSeriesParent = document.getElementById('gt-time-series');
      const gtGeoMapParent = document.getElementById('gt-geo-map');
      if (gtTimeSeriesParent.children.length > 0 && gtGeoMapParent.children.length > 0) {
        gtTimeSeriesParent.removeChild(gtTimeSeriesParent.children[0]);
        gtGeoMapParent.removeChild(gtGeoMapParent.children[0]);
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
    }
  }, [isLoading, searchTime, searchArea]);

  return (
    <Card loading={isLoading} bodyStyle={{ height: '1080px'}}>
      <Meta
        title={
          <Row>
            <Col span={12}>
              <Select
                showSearch
                defaultValue='worldwide'
                bordered={false}
                style={{
                  width: '100%',
                }}
                onChange={v => setSearchArea(clist.getNameList()[v])}
              >
                <Option key='worldwide' value='worldwide'>{getFormattedMessage('area.Worldwide')}</Option>
                {Object.keys(clist.getNameList()).sort().map(k => 
                  <Option key={k} value={k}>{getFormattedMessage(`area.${getCapitalizedString(k)}`, {}, getCapitalizedString(k))}</Option>
                )}
              </Select>
            </Col>
            <Col span={12}>
              <Select
                defaultValue='now 7-d'
                bordered={false}
                style={{
                  width: '100%',
                }}
                onChange={v => setSearchTime(v)}
              >
                <Option value='now 1-H'>{getFormattedMessage('gt.time.now 1-H')}</Option>
                <Option value='now 4-H'>{getFormattedMessage('gt.time.now 4-H')}</Option>
                <Option value='now 1-d'>{getFormattedMessage('gt.time.now 1-d')}</Option>
                <Option value='now 7-d'>{getFormattedMessage('gt.time.now 7-d')}</Option>
                <Option value='today 1-m'>{getFormattedMessage('gt.time.today 1-m')}</Option>
                <Option value='today 3-m'>{getFormattedMessage('gt.time.today 3-m')}</Option>
                <Option value='today 12-m'>{getFormattedMessage('gt.time.today 12-m')}</Option>
              </Select>
            </Col>
          </Row>
        }
        description={
          <Row>
            <Col id='gt-time-series' span={24}>
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
            <Col id='gt-geo-map' span={24}>
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
