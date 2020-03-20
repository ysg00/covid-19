import React, { useEffect } from 'react';
import { batch, useDispatch } from 'react-redux';
import Papa from 'papaparse';
import moment from 'moment';

const MainContainer = ({children, ...rest}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // yesterday.setDate(yesterday.getDate() - 1);
    const features = [];
    const featureIdx = {};
    const countryIdx = {};
    const latestUpdate = {};
    const lastUpdate = {};
    const yesterdayData = {};
    const yesterday = moment(new Date().setDate(new Date().getDate() - 1)).format('MM-DD-YYYY');
    const urls = [
      'https://services1.arcgis.com/0MSEUqKaxRlEPj5g/ArcGIS/rest/services/ncov_cases/FeatureServer/2/query?where=1%3D1&outFields=*&f=json',
      'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv',
      'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Recovered.csv',
      'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Deaths.csv',
      `https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/${yesterday}.csv`,
    ];

    const generateData = (csv, dataKey) => {
      // jhu csv header format: [province, country, lat, long, date...]
      const header = csv[0];
      csv.slice(1).forEach((arr, i) => {
      if (features[i]) {
        features[i].properties[dataKey] = arr.slice(4).map((count, timeIdx) => ({
          time: new Date(header[timeIdx + 4]),
          count: parseInt(count),
        }));
      } else {
        if (countryIdx[arr[1]]) {
          countryIdx[arr[1]].push(i);
        } else {
          countryIdx[arr[1]] = [i];
        }
        featureIdx[`${arr[1]}-${arr[0]}`] = i;
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
        const globData = {
          confirmed: 0,
          recovered: 0,
          deaths: 0,
          lastUpdate: new Date(),
        };
        json.features.forEach(f => {
          lastUpdate[f.attributes.Country_Region] = {
            confirmed: f.attributes.Confirmed,
            recovered: f.attributes.Recovered,
            deaths: f.attributes.Deaths,
            lastUpdate: f.attributes.Last_Update,
          };
          globData.confirmed += f.attributes.Confirmed;
          globData.recovered += f.attributes.Recovered;
          globData.deaths += f.attributes.Deaths;
        });
        lastUpdate['Global'] = {
          ...globData,
          lastUpdate: lastUpdate['US'].lastUpdate,
        };
      }).catch(e => {
        console.log(e);
      });
    };
    const handleResTimeSeries = res => {
      const { csvData, idx } = res;
      if (idx === 0) {
        generateData(csvData, 'confirmed')
      } else if (idx === 1) {
        generateData(csvData, 'recovered')
      } else if (idx === 2) {
        generateData(csvData, 'deaths')
      } else {
        const globalInc = {
          confirmed: 0,
          recovered: 0,
          deaths: 0,
        };
        csvData.slice(1).forEach(arr => {
          if (arr[1]) {
            if (yesterdayData[arr[1]]) {
              yesterdayData[arr[1]].confirmed += parseInt(arr[3]);
              yesterdayData[arr[1]].recovered += parseInt(arr[5]);
              yesterdayData[arr[1]].deaths += parseInt(arr[4]);
            } else {
              yesterdayData[arr[1]] = {
                confirmed: parseInt(arr[3]),
                recovered: parseInt(arr[5]),
                deaths: parseInt(arr[4]),
              };
            }
            globalInc.confirmed += parseInt(arr[3]);
            globalInc.recovered += parseInt(arr[5]);
            globalInc.deaths += parseInt(arr[4]);
          }
        });
        Object.entries(lastUpdate).forEach(([k, v]) => {
          if (yesterdayData[k]) {
            const { confirmed, recovered, deaths } = v;
            latestUpdate[k] = {
              ...v,
              increment: {
                confirmed: confirmed - yesterdayData[k].confirmed,
                recovered: recovered - yesterdayData[k].recovered,
                deaths: deaths - yesterdayData[k].deaths,
              },
            };    
          }
        });
        latestUpdate['Global'] = {
          ...lastUpdate['Global'],
          increment: {
            confirmed: lastUpdate.Global.confirmed - globalInc.confirmed,
            recovered: lastUpdate.Global.recovered - globalInc.recovered,
            deaths: lastUpdate.Global.deaths - globalInc.deaths,
          },
        };
        batch(() => {
          // dispatch({ type: 'UPDATE_TIMESERIES_DATA', timeSeriesData: {
          //   glob: globTimeSeries,
          //   us: usTimeSeries,
          //   c: cTimeSeries
          // }});
          dispatch({ type: 'UPDATE_LATESTUPDATE_DATA', latestUpdate });
          dispatch({ type: 'UPDATE_FEATURES', features });
          dispatch({ type: 'UPDATE_FEATUREIDX', featureIdx });
        });
        dispatch({ type: 'DONE_LOADING'});
      }
    };

    Promise.all(urls.map(u => fetch(u))).then(res => {
      handleResLastUpdate(res[0]);
      res.slice(1).forEach((r, i) => {
        r.text().then(t => {
          Papa.parse(t, {
            complete: e => handleResTimeSeries({ csvData: e.data, idx: i }),
          });
        }).catch(e => console.log(e));
      });
    });
  }, [dispatch]);

  return (
    <div {...rest}>
      {children}
    </div>
  );
};

export default MainContainer;