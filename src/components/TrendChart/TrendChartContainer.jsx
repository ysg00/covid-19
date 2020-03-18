import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { batch } from 'react-redux';
import { Card, Row, Col } from 'antd';
import TrendChart from './TrendChart';


const TrendChartContainer = props => {
  const [isLoading, setIsLoading] = useState(true);
  const [timeSeries, setTimeSeries] = useState({});
  const { Meta } = Card;
  useEffect(() => {
    const urls = [
      'https://services1.arcgis.com/0MSEUqKaxRlEPj5g/ArcGIS/rest/services/ncov_cases/FeatureServer/2/query?where=1%3D1&outFields=*&f=json',
      'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv',
      'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Recovered.csv',
      'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Deaths.csv'
    ];
    const cTimeSeries = {
      time: [],
      confirmed: [],
      recovered: [],
      deaths: [],
    };
    const usTimeSeries = {
      time: [],
      confirmed: [],
      recovered: [],
      deaths: [],
    };
    const globTimeSeries = {
      time: [],
      confirmed: [],
      recovered: [],
      deaths: [],
    }
    const databuf = {
      usData: {},
      globData: {},
    };
    const handleResLastUpdate = res => {
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
        databuf.usData = Object.assign({}, usData);
        databuf.globData = Object.assign({}, globData);
        databuf.cData = Object.assign({}, cData);
      }).catch(e => {
        console.log(e);
      });
    }
    const handleResTimeSeries = res => {
      const searchUs = (arr, situation, idx) => {
        arr.forEach(a => {
          if (a[1] === 'US') {
            usTimeSeries[situation][idx] += parseInt(a[idx + 4]);
          }
          if (a[1] === 'China') {
            cTimeSeries[situation][idx] += parseInt(a[idx + 4]);
          }
          globTimeSeries[situation][idx] += parseInt(a[idx + 4]);
        });
      }
      const { csvData, idx } = res;
      if (globTimeSeries.time.length === 0) {
        const time = csvData[0].slice(4).map(t => {
          const arr = t.split('/');
          arr.unshift(`20${arr.pop()}`);
          return arr.join('-');
        })
        cTimeSeries.time = [...time];
        cTimeSeries.confirmed = new Array(cTimeSeries.time.length).fill(0)
        cTimeSeries.recovered = new Array(cTimeSeries.time.length).fill(0)
        cTimeSeries.deaths = new Array(cTimeSeries.time.length).fill(0)
        usTimeSeries.time = [...time];
        usTimeSeries.confirmed = new Array(usTimeSeries.time.length).fill(0)
        usTimeSeries.recovered = new Array(usTimeSeries.time.length).fill(0)
        usTimeSeries.deaths = new Array(usTimeSeries.time.length).fill(0)
        globTimeSeries.time = [...time];
        globTimeSeries.confirmed = new Array(globTimeSeries.time.length).fill(0)
        globTimeSeries.recovered = new Array(globTimeSeries.time.length).fill(0)
        globTimeSeries.deaths = new Array(globTimeSeries.time.length).fill(0)
      }
      if (idx === 0) {
        globTimeSeries.time.forEach((_, i) => searchUs(csvData, 'confirmed', i));
      } else if (idx === 1) {
        globTimeSeries.time.forEach((_, i) => searchUs(csvData, 'recovered', i));
      } else {
        globTimeSeries.time.forEach((_, i) => searchUs(csvData, 'deaths', i));
        const dLen = globTimeSeries.confirmed.length;
        globTimeSeries.confirmed[dLen - 1] = databuf.globData.Confirmed;
        globTimeSeries.recovered[dLen - 1] = databuf.globData.Recovered;
        globTimeSeries.deaths[dLen - 1] = databuf.globData.Deaths;
        cTimeSeries.confirmed[dLen - 1] = databuf.cData.Confirmed;
        cTimeSeries.recovered[dLen - 1] = databuf.cData.Recovered;
        cTimeSeries.deaths[dLen - 1] = databuf.cData.Deaths;
        usTimeSeries.confirmed[dLen - 1] = databuf.usData.Confirmed;
        usTimeSeries.recovered[dLen - 1] = databuf.usData.Recovered;
        usTimeSeries.deaths[dLen - 1] = databuf.usData.Deaths;
        batch(() => {
          setIsLoading(false);
          setTimeSeries({
            glob: globTimeSeries,
            us: usTimeSeries,
            c: cTimeSeries
          });
        });
      }
    }

    Promise.all(urls.map(u => fetch(u))).then(res => {
      handleResLastUpdate(res[0]);
      res.slice(1, 4).forEach((r, i) => {
        r.text().then(t => {
          Papa.parse(t, {
            complete: e => handleResTimeSeries({ csvData: e.data, idx: i }),
          });
        }).catch(e => console.log(e));
      });
    });
  }, []);
  return (
    <Row justify='space-between'>
      <Col span={8}>
        <Card
          loading={isLoading}
        >
          <Meta
            title='Global Case TimeSeries'
            description={<TrendChart {...timeSeries.glob} />}
          />
        </Card>
      </Col>
      <Col span={8}>
        <Card
          loading={isLoading}
        >
          <Meta
            title='China Case TimeSeries'
            description={<TrendChart {...timeSeries.c} />}
          />
        </Card>
      </Col>
      <Col span={8} className='float-right'>
        <Card
          loading={isLoading}
        >
          <Meta
            title='US Case TimeSeries'
            description={<TrendChart {...timeSeries.us} />}
          />
        </Card>
      </Col>

    </Row>
  );
}

export default TrendChartContainer;