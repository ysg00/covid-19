import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import c3 from 'c3';
import moment from 'moment';

const DataTableChart = props => {
  const {
    time,
    confirmed,
    recovered,
    deaths,
  } = props;
  const [labels, setLabels] = useState({
    confirmed: 'Confirmed',
    recovered: 'Recovered',
    deaths: 'deaths',
  });
  const ref = useRef();
  const locale = useSelector(state => state.locale);
  useEffect(() => {
    if (locale === 'en') {
      setLabels({
        confirmed: 'Confirmed',
        recovered: 'Recovered',
        deaths: 'deaths',
      });
    } else {
      setLabels({
        confirmed: '确诊',
        recovered: '治愈',
        deaths: '死亡',
      });
    }
  }, [locale]);
  useEffect(() => {
    const total = [...confirmed, ...recovered, ...deaths]
    const tmpMax = Math.max(...total);
    let yMax = tmpMax;
    while (yMax % 1000 !== 0) {
      yMax += 1;
    }
    const tickVal = yMax / 4;
    const yRange = [0, tickVal, tickVal*2, tickVal*3, yMax];
    const tickFormatter = x => (x%250 === 0 && x !== 0? `${(x/1000).toFixed(2)}k` : `${x}`);
    c3.generate({
      bindto: ref.current,
      padding: {
        left: 50,
        top: 10,
        right: 16,
        bottom: -10,
      },
      data: {
        x: 'x',
        columns: [
          ['x', ...time],
          [labels.confirmed, ...confirmed],
          [labels.recovered, ...recovered],
          [labels.deaths, ...deaths],
        ],
        types: {
          [labels.confirmed]: 'line',
          [labels.recovered]: 'line',
          [labels.deaths]: 'line',
        },
        colors: {
          [labels.confirmed]: '#FF6E6D',
          [labels.recovered]: '#66B46A',
          [labels.deaths]: '#606060',
        },
      },
      point: {
        show: false,
      },
      axis: {
        x: {
          type: 'timeseries',
          tick: {
            count: 2,
            values: ['2020-02-01', '2020-03-01'],
            format: '%b',
            multiline: false,
          },
        },
        y: {
          type: 'linear',
          min: 0,
          max: yMax,
          padding: {
            bottom: 0,
            top: 0,
          },
          tick: {
            count: 5,
            values: yRange,
            format: tickFormatter,
          },
        },
      },
      tooltip: {
        format: {
          title: (_, idx) => moment(time[idx]).format('YYYY-MM-DD'),
        },
        position(data, width, height, element) {
          return {
            top: 25,
            left: 55,
          };
        },
      },
    });
  }, [time, confirmed, recovered, deaths, labels]);

  return (
    <div className='trend-chart' ref={ref} />
  );
};

export default DataTableChart;