import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
} from 'recharts';
import { getFormattedDateYYYYMMDD } from './../../utils/Formatter';

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
  
  return (
    <LineChart
      width={450}
      height={300}
      data={confirmed.map((_, i) => ({
        time: getFormattedDateYYYYMMDD(time[i]),
        [labels.confirmed]: confirmed[i],
        [labels.recovered]: recovered[i],
        [labels.deaths]: deaths[i],
      }))}
      margin={{ top: 16, right: 10, bottom: 4, left: -16 }}
    >
      <XAxis
        type='category'
        dataKey="time"
        tickSize={5}
      />
      <YAxis
        tickFormatter={t => t >= 1000 ? `${(t / 1000)}k` : t}
      />
      <Tooltip
        contentStyle={{
          backgroundColor: 'rgba(255, 255, 255, 0)',
          border: 'none',
        }}
      />
      <Line
        type="monotone"
        dataKey={labels.confirmed}
        stroke="#FF6E6D"
        dot={false}
      />
      <Line
        type="monotone"
        dataKey={labels.recovered}
        stroke="#66B46A"
        dot={false}
      />
      <Line
        type="monotone"
        dataKey={labels.deaths}
        stroke="#606060"
        dot={false}
      />
    </LineChart>
  );
};

export default DataTableChart;