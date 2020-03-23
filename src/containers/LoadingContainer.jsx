import React, { useEffect } from 'react';
import { batch, useDispatch } from 'react-redux';
import Papa from 'papaparse';
import moment from 'moment';

export default ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const features = [];
    const featureIdx = {};
    const timeSeries = {};
    const timeSeriesWorldwide = {};
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
        if (arr[1]) {
          if (features[i]) {
            features[i].properties[dataKey] = arr.slice(4).map((count, ii) => ({
              time: new Date(header[ii + 4]),
              count: count === '' ? parseInt(arr[ii + 3]) : parseInt(count),
            }));
          } else {
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
                [dataKey]: arr.slice(4).map((count, ii) => ({
                  time: new Date(header[ii + 4]),
                  count: count === '' ? parseInt(arr[ii + 3]) : parseInt(count),
                })),
              }
            });
          }
          if (lastUpdate[arr[1]]) {
            if (timeSeries[arr[1]]) {
              if (timeSeries[arr[1]][dataKey]) {
                timeSeries[arr[1]][dataKey].forEach((dk, ii) => {
                  timeSeries[arr[1]][dataKey][ii] = dk + parseInt(arr[ii+4])
                });
              } else {
                timeSeries[arr[1]][dataKey] = [...arr.slice(4)].map(d => parseInt(d));
              }
            }
            else {
              timeSeries[arr[1]] = {
                time: [...header.slice(4)].map(d => new Date(d)),
                [dataKey]: [...arr.slice(4)].map(d => parseInt(d)),
              };
            }
            if (Object.keys(timeSeriesWorldwide).length) {
              timeSeriesWorldwide[dataKey].forEach((dk, ii) => {
                timeSeriesWorldwide[dataKey][ii] = dk + parseInt(arr[ii+4])
              });
            } else {
              const dLen = arr.length-4;
              Object.assign(timeSeriesWorldwide, {
                time: [...header.slice(4)].map(d => new Date(d)),
                confirmed: Array(dLen).fill(0),
                recovered: Array(dLen).fill(0),
                deaths: Array(dLen).fill(0),
                [dataKey]: [...arr.slice(4)].map(d => parseInt(d)),
              });
            }
          }
        }
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
        const worldwideInc = {
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
            worldwideInc.confirmed += parseInt(arr[3]);
            worldwideInc.recovered += parseInt(arr[5]);
            worldwideInc.deaths += parseInt(arr[4]);
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
        latestUpdate['Worldwide'] = {
          ...lastUpdate['Worldwide'],
          increment: {
            confirmed: lastUpdate.Worldwide.confirmed - worldwideInc.confirmed,
            recovered: lastUpdate.Worldwide.recovered - worldwideInc.recovered,
            deaths: lastUpdate.Worldwide.deaths - worldwideInc.deaths,
          },
        };
        Object.assign(timeSeries, {
          ...timeSeries,
          Worldwide: timeSeriesWorldwide,
        });
        Object.keys(timeSeries).forEach(k => {
          if (latestUpdate[k]) {
            const dLen = timeSeries[k].confirmed.length;
            timeSeries[k].confirmed[dLen-1] = latestUpdate[k].confirmed;
            timeSeries[k].recovered[dLen-1] = latestUpdate[k].recovered;
            timeSeries[k].deaths[dLen-1] = latestUpdate[k].deaths;
          } else {
            delete timeSeries[k];
          }

        });
        batch(() => {
          dispatch({ type: 'UPDATE_TIMESERIES', timeSeries: {
            ...timeSeries,
            Worldwide: timeSeriesWorldwide,
          }});
          dispatch({ type: 'UPDATE_LATESTUPDATE', latestUpdate });
          dispatch({ type: 'UPDATE_FEATURES', features });
          dispatch({ type: 'UPDATE_FEATUREIDX', featureIdx });
        });
        console.log(features)
        dispatch({ type: 'DONE_LOADING'});
      }
    };

    Promise.all(urls.map(u => fetch(u))).then(async res => {
      res[0].json().then(json => {
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
        lastUpdate['Worldwide'] = {
          ...globData,
          lastUpdate: lastUpdate['US'].lastUpdate,
        };
        res[1].text().then(t => {
          Papa.parse(t, {
            complete: e => handleResTimeSeries({ csvData: e.data, idx: 0 }),
          });
          res[2].text().then(t => {
            Papa.parse(t, {
              complete: e => handleResTimeSeries({ csvData: e.data, idx: 1 }),
            });
            res[3].text().then(t => {
              Papa.parse(t, {
                complete: e => handleResTimeSeries({ csvData: e.data, idx: 2 }),
              });
              res[4].text().then(t => {
                Papa.parse(t, {
                  complete: e => handleResTimeSeries({ csvData: e.data, idx: 3 }),
                });
              }).catch(e => console.log(e));
            }).catch(e => console.log(e));
          }).catch(e => console.log(e));
        }).catch(e => console.log(e));
      }).catch(e => console.log(e));
    }).catch(e => console.log(e));
  }, [dispatch]);
  
  return (
    <>
      {children}
    </>
  );
};
