import React, { useEffect, useRef } from 'react';
import c3 from 'c3';
import './TrendChart.scss';

const TrendChart = props => {
  const {
    time,
    confirmed,
    recovered,
    deaths,
  } = props;
  const ref = useRef();
  useEffect(() => {
    const confirmedLabel = 'Confirmed';
    const recoveredLabel = 'Recovered';
    const deathLabel = 'Deaths';
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
          [confirmedLabel, ...confirmed],
          [recoveredLabel, ...recovered],
          [deathLabel, ...deaths],
        ],
        types: {
          [confirmedLabel]: 'line',
          [recoveredLabel]: 'line',
          [deathLabel]: 'line',
        },
        colors: {
          [confirmedLabel]: '#FF6E6D',
          [recoveredLabel]: '#66B46A',
          [deathLabel]: '#606060',
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
          title: (_, idx) => time[idx],
        },
        position(data, width, height, element) {
          return {
            top: 25,
            left: 55,
          };
        },
      },
    });
  }, [time, confirmed, recovered, deaths]);

  return (
    <div className='trend-chart' ref={ref} />
  );
};

export default TrendChart;