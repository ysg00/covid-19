import React, { useState, useEffect } from 'react';
import { batch, useDispatch } from 'react-redux';
import Papa from 'papaparse';

const MainContainer = ({children, ...rest}) => {
  const dispatch = useDispatch();

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
      Global: {},
      US: {},
      China: {}
    };
    const features = [];
    const idxmap = {};
    const searchArea = (arr, sit, idx) => {
      arr.forEach(a => {
        if (a[1] === 'US') {
          usTimeSeries[sit][idx] += parseInt(a[idx + 4]);
        }
        if (a[1] === 'China') {
          cTimeSeries[sit][idx] += parseInt(a[idx + 4]);
        }
        globTimeSeries[sit][idx] += parseInt(a[idx + 4]);
      });
    };

    const generateData = (csv, dataKey, init) => {
      // jhu csv header format: [province, country, lat, long, date...]
      const header = csv[0];
      csv.slice(1).forEach((arr, i) => {
      if (features[i]) {
        features[i].properties[dataKey] = arr.slice(4).map((count, timeIdx) => ({
          time: new Date(header[timeIdx + 4]),
          count: parseInt(count),
        }));
      } else {
        if (idxmap[`${arr[1]}-${arr[0]}`]) {
          idxmap[`${arr[1]}-${arr[0]}`] += 1;
          console.log(`${arr[1]}-${arr[0]}`);
        } else {
          idxmap[`${arr[1]}-${arr[0]}`] = 1;
        }
        features.push({
          id: i,
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [parseFloat(arr[3]), parseFloat(arr[2])],
          },
          properties: {
            country: arr[1],
            province: arr[0],
            [dataKey]: arr.slice(4).map((count, timeIdx) => ({
              time: new Date(header[timeIdx + 4]),
              count: parseInt(count),
            })),
          }
        });
      }
      });
    };

    const handleResLastUpdate = res => {
      res.json().then(json => {
        if (!json.features) {
          throw new Error('error fetch data');
        }
        let usData = {};
        let cData = {};
        const globData = {
          confirmed: 0,
          recovered: 0,
          deaths: 0,
          lastUpdate: new Date(),
        };
        for (let i = 0; i < json.features.length; i += 1) {
          if (json.features[i].attributes && json.features[i].attributes.Country_Region === 'US') {
            usData = Object.assign({}, (json.features[i].attributes));
          }
          if (json.features[i].attributes && json.features[i].attributes.Country_Region === 'China') {
            cData = Object.assign({}, (json.features[i].attributes));
          }
          globData.confirmed += json.features[i].attributes.Confirmed;
          globData.recovered += json.features[i].attributes.Recovered;
          globData.deaths += json.features[i].attributes.Deaths;
        }
        databuf.US = {
          confirmed: usData.Confirmed,
          recovered: usData.Recovered,
          deaths: usData.Deaths,
          lastUpdate: usData.Last_Update,
        }
        databuf.Global = {
          confirmed: globData.confirmed,
          recovered: globData.recovered,
          deaths: globData.deaths,
          lastUpdate: usData.Last_Update,
        }
        databuf.China = {
          confirmed: cData.Confirmed,
          recovered: cData.Recovered,
          deaths: cData.Deaths,
          lastUpdate: cData.Last_Update,
        }
      }).catch(e => {
        console.log(e);
      });
    }
    const handleResTimeSeries = res => {
      const { csvData, idx } = res;
      if (globTimeSeries.time.length === 0) {
        const time = csvData[0].slice(4).map(t => {
          const arr = t.split('/');
          arr.unshift(`20${arr.pop()}`);
          return arr.join('-');
        });
        [globTimeSeries, cTimeSeries, usTimeSeries].forEach(obj => {
          Object.keys(obj).forEach(o => {
            if (o ==='time') {
              obj[o] = [...time];
            } else {
              obj[o]= new Array(time.length).fill(0);
            }
          });
        });
      }
      if (idx === 0) {
        globTimeSeries.time.forEach((_, i) => searchArea(csvData, 'confirmed', i));
        generateData(csvData, 'confirmed', true)
      } else if (idx === 1) {
        globTimeSeries.time.forEach((_, i) => searchArea(csvData, 'recovered', i));
        generateData(csvData, 'recovered', false)
      } else {
        globTimeSeries.time.forEach((_, i) => searchArea(csvData, 'deaths', i));
        generateData(csvData, 'deaths', false)
        const dLen = globTimeSeries.confirmed.length;
        [ { obj: globTimeSeries, key: 'Global' }, 
          { obj: cTimeSeries, key: 'China' },
          { obj: usTimeSeries, key: 'US' } ].forEach(({ obj, key }) => {
          Object.keys(obj).forEach(o => {
            if (o !== 'time') {
              obj[o][dLen - 1] = databuf[key][o];
            }
          });
        });
        batch(() => {
          dispatch({ type: 'UPDATE_TIMESERIES_DATA', timeSeriesData: {
            glob: globTimeSeries,
            us: usTimeSeries,
            c: cTimeSeries
          }});
          dispatch({ type: 'UPDATE_LASTUPDATE_DATA', lastUpdateData: databuf });
          dispatch({ type: 'DONE_LOADING'});
          dispatch({ type: 'UPDATE_GEOJSON', geoJson: {
            type: 'FeatureCollection',
            features,
          }});
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
    <div {...rest}>
      {children}
    </div>
  );
};

export default MainContainer;