import React, { useEffect } from 'react';
import { batch, useDispatch } from 'react-redux';
import Papa from 'papaparse';
import { getFormattedDateMMDDYYYY } from './../utils/Formatter';

export default ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const usLatLong = {'US-Washington': [47.4009, -121.4905], 'US-New York': [42.1657, -74.9481], 'US-California': [36.1162, -119.6816], 'US-Massachusetts': [42.2302, -71.5301], 'US-Diamond Princess': [35.4437, 139.638], 'US-Grand Princess': [37.6489, -122.6655], 'US-Georgia': [33.0406, -83.6431], 'US-Colorado': [39.0598, -105.3111], 'US-Florida': [27.7663, -81.6868], 'US-New Jersey': [40.2989, -74.521], 'US-Oregon': [44.572, -122.0709], 'US-Texas': [31.0545, -97.5635], 'US-Illinois': [40.3495, -88.9861], 'US-Pennsylvania': [40.5908, -77.2098], 'US-Iowa': [42.0115, -93.2105], 'US-Maryland': [39.0639, -76.8021], 'US-North Carolina': [35.6301, -79.8064], 'US-South Carolina': [33.8569, -80.945], 'US-Tennessee': [35.7478, -86.6923], 'US-Virginia': [37.7693, -78.17], 'US-Arizona': [33.7298, -111.4312], 'US-Indiana': [39.8494, -86.2583], 'US-Kentucky': [37.6681, -84.6701], 'US-District of Columbia': [38.8974, -77.0268], 'US-Nevada': [38.3135, -117.0554], 'US-New Hampshire': [43.4525, -71.5639], 'US-Minnesota': [45.6945, -93.9002], 'US-Nebraska': [41.1254, -98.2681], 'US-Ohio': [40.3888, -82.7649], 'US-Rhode Island': [41.6809, -71.5118], 'US-Wisconsin': [44.2685, -89.6165], 'US-Connecticut': [41.5978, -72.7554], 'US-Hawaii': [21.0943, -157.4983], 'US-Oklahoma': [35.5653, -96.9289], 'US-Utah': [40.15, -111.8624], 'US-Kansas': [38.5266, -96.7265], 'US-Louisiana': [31.1695, -91.8678], 'US-Missouri': [38.4561, -92.2884], 'US-Vermont': [44.0459, -72.7107], 'US-Alaska': [61.3707, -152.4044], 'US-Arkansas': [34.9697, -92.3731], 'US-Delaware': [39.3185, -75.5071], 'US-Idaho': [44.2405, -114.4788], 'US-Maine': [44.6939, -69.3819], 'US-Michigan': [43.3266, -84.5361], 'US-Mississippi': [32.7416, -89.6787], 'US-Montana': [46.9219, -110.4544], 'US-New Mexico': [34.8405, -106.2485], 'US-North Dakota': [47.5289, -99.784], 'US-South Dakota': [44.2998, -99.4388], 'US-West Virginia': [38.4912, -80.9545], 'US-Wyoming': [42.756, -107.3025], 'US-Washington, D.C.': [38.9072, -77.0369], 'US-Alabama': [32.3182, -86.9023], 'US-Puerto Rico': [18.2208, -66.5901], 'US-Guam': [13.4443, 144.7937], 'US-Virgin Islands': [18.3358, -64.8963]};
    const features = [];
    const featureIdx = {};
    const timeSeries = {};
    const timeSeriesWorldwide = {};
    const latestUpdate = {};
    const lastUpdate = {};
    const yesterdayData = {};
    let globalIdx = 0;
    const yesterday = getFormattedDateMMDDYYYY(new Date(new Date().setDate(new Date().getDate() - 1)));
    const urls = [
      'https://services1.arcgis.com/0MSEUqKaxRlEPj5g/ArcGIS/rest/services/ncov_cases/FeatureServer/2/query?where=1%3D1&outFields=*&f=json',
      'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv',
      'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv',
      'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv',
      'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_US.csv',
      'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_US.csv',
      `https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/${yesterday}.csv`,
    ];
    const speciallyHandleCondition = (country, province) => {
      // handle special case due to the data
      return (
        (
          country === 'US'
          && province === ''
        ) || (
          country === 'Australia'
          && province === 'From Diamond Princess'
        ) || (
          country === 'Canada'
          && province === 'Recovered'
        )
      );
    };
    const generateData = (csv, dataKey) => {
      // jhu csv header format: [province, country, lat, long, date...]
      const header = csv[0];
      csv.slice(1).forEach(arr => {
        if (arr[1] && !speciallyHandleCondition(arr[1], arr[0])) {
          const currentFeatureIdx = featureIdx[`${arr[1]}-${arr[0]}`];
          if (currentFeatureIdx !== undefined) {
            features[currentFeatureIdx].properties[dataKey] = arr.slice(4).map((count, ii) => ({
              time: new Date(header[ii + 4] + ' 00:00'),
              count: count === '' ? parseInt(arr[ii + 3]) : parseInt(count),
            }));
            const dLen = features[currentFeatureIdx].properties.confirmed.length;
            if (!features[currentFeatureIdx].properties[dataKey][dLen - 1]) {
              features[currentFeatureIdx].properties[dataKey][dLen - 1] = features[currentFeatureIdx].properties[dataKey][dLen - 2]
            }
          } else {
            featureIdx[`${arr[1]}-${arr[0]}`] = globalIdx;
            features.push({
              id: globalIdx,
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [parseFloat(arr[3]), parseFloat(arr[2])],
              },
              properties: {
                country: arr[1],
                province: arr[0],
                [dataKey]: arr.slice(4).map((count, ii) => ({
                  time: new Date(header[ii + 4] + ' 00:00'),
                  count: count === '' ? parseInt(arr[ii + 3]) : parseInt(count),
                })),
              }
            });
            globalIdx += 1;
          }
          if (lastUpdate[arr[1]]) {
            if (timeSeries[arr[1]]) {
              if (timeSeries[arr[1]][dataKey]) {
                timeSeries[arr[1]][dataKey].forEach((dk, ii) => {
                  timeSeries[arr[1]][dataKey][ii] = dk + parseInt(arr[ii + 4])
                });
              } else {
                timeSeries[arr[1]][dataKey] = [...arr.slice(4)].map(d => parseInt(d));
              }
            }
            else {
              timeSeries[arr[1]] = {
                time: [...header.slice(4)].map(d => new Date(d + ' 00:00')),
                [dataKey]: [...arr.slice(4)].map(d => parseInt(d)),
              };
            }
            if (Object.keys(timeSeriesWorldwide).length) {
              timeSeriesWorldwide[dataKey].forEach((dk, ii) => {
                timeSeriesWorldwide[dataKey][ii] = dk + parseInt(arr[ii + 4])
              });
            } else {
              const dLen = arr.length - 4;
              Object.assign(timeSeriesWorldwide, {
                time: [...header.slice(4)].map(d => new Date(d + ' 00:00')),
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
    const generateUsData = csv => {
      const dic = {};
      const header = csv[0].slice(6)
      header.splice(4, 1)
      csv.slice(1).forEach((arr, i) => {
        arr = arr.slice(6);
        arr.splice(4, 1);
        if (arr[1]) {
          const key = `${arr[1]}-${arr[0]}`;
          if (dic[key]) {
            dic[key].slice(4).forEach((_, ii) => {
              dic[key][ii + 4] = parseInt(dic[key][ii + 4]) + parseInt(arr[ii + 4]);
            })
          } else {
            dic[key] = [...arr];
          }
        }
      });
      return [header, ...Object.values(dic).map(v => {
        const key = `${v[1]}-${v[0]}`;
        const ret = [...v]
        if (usLatLong[key]) {
          ret[2] = usLatLong[key][0];
          ret[3] = usLatLong[key][1];
        }
        return ret;
      })];
    };
    const handleResTimeSeries = res => {
      const { csvData, idx } = res;
      if (idx === 0) {
        generateData(csvData, 'confirmed')
      } else if (idx === 1) {
        generateData(csvData, 'recovered')
      } else if (idx === 2) {
        generateData(csvData, 'deaths')
      } else if (idx === 3) {
        const usd = generateUsData(csvData);
        generateData(usd, 'confirmed')
        csvData.slice(1).forEach((arr, i) => {
          arr.slice(11).forEach((_, j) => {
            csvData[i][j + 11] = 0;
          });
        });
        generateData(generateUsData(csvData), 'recovered')
      } else if (idx === 4) {
        csvData.forEach((_, i) => csvData[i].splice(11, 1));
        generateData(generateUsData(csvData), 'deaths')
      } else {
        const geoFeatures = [];
        features.forEach(f => {
          if (f.properties.country === 'Canada' && f.properties.confirmed && f.properties.deaths) {
            f.properties.recovered = Array(f.properties.confirmed.length).fill(0);
          }
          if (f.properties.confirmed && f.properties.recovered && f.properties.deaths) {
            geoFeatures.push(f);
          }
        });
        const worldwideInc = {
          confirmed: 0,
          recovered: 0,
          deaths: 0,
        };
        csvData.slice(1).forEach(arr => {
          if (arr[3]) {
            if (yesterdayData[arr[3]]) {
              yesterdayData[arr[3]].confirmed += parseInt(arr[7]);
              yesterdayData[arr[3]].recovered += parseInt(arr[9]);
              yesterdayData[arr[3]].deaths += parseInt(arr[8]);
            } else {
              yesterdayData[arr[3]] = {
                confirmed: parseInt(arr[7]),
                recovered: parseInt(arr[9]),
                deaths: parseInt(arr[8]),
              };
            }
            worldwideInc.confirmed += parseInt(arr[7]);
            worldwideInc.recovered += parseInt(arr[9]);
            worldwideInc.deaths += parseInt(arr[8]);
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
          if (latestUpdate[k] && timeSeries[k]) {
            const dLen = timeSeries[k].confirmed.length - 1;
            let del = false;
            if (timeSeries[k].confirmed) {
              timeSeries[k].confirmed[dLen] = latestUpdate[k].confirmed;
            } else {
              del = true;
            }
            if (timeSeries[k].recovered) {
              timeSeries[k].recovered[dLen] = latestUpdate[k].recovered;
            } else {
              timeSeries[k].recovered = Array(dLen).fill(0);
            }
            if (timeSeries[k].deaths) {
              timeSeries[k].deaths[dLen] = latestUpdate[k].deaths;
            } else {
              timeSeries[k].deaths = Array(dLen).fill(0);
            }
            if (del) {
              delete timeSeries[k];
            }
          } else {
            delete timeSeries[k];
          }
        });
        batch(() => {
          dispatch({ type: 'UPDATE_TIMESERIES', timeSeries });
          dispatch({ type: 'UPDATE_LATESTUPDATE', latestUpdate });
          dispatch({ type: 'UPDATE_FEATURES', features: geoFeatures });
          dispatch({ type: 'UPDATE_FEATUREIDX', featureIdx });
        });
        dispatch({ type: 'DONE_LOADING' });
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
                res[5].text().then(t => {
                  Papa.parse(t, {
                    complete: e => handleResTimeSeries({ csvData: e.data, idx: 4 }),
                  });
                  res[6].text().then(t => {
                    Papa.parse(t, {
                      complete: e => handleResTimeSeries({ csvData: e.data, idx: 5 }),
                    });
                  }).catch(e => console.log(e));
                }).catch(e => console.log(e));
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
