import React, { useState, useEffect } from 'react';
import { useSelector, batch } from 'react-redux';
import { Card } from 'antd';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { getFormatMessage, getFormattedMessage, getFormattedDateYYYYMMDD } from './../../utils/Formatter';

const WorldwideChart = props => {
  const timeSeries = useSelector(state => state.timeSeries);
  const isLoading = useSelector(state => state.isLoading);
  const locale = useSelector(state => state.locale);
  const { Meta } = Card;
  const [dataLabel, setDataLabel] = useState([]);
  const [renderData, setRenderData] = useState([]);
  const getRandomColor = () => {
    const letters = '456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 12)];
    }
    return color;
  }

  useEffect(() => {
    if (!isLoading) {
      const longestTimeline = {
        area: '',
        length: 0,
      };
      Object.entries(timeSeries).forEach(([k, v]) => {
        if (v.time.length > longestTimeline.length) {
          longestTimeline.area = k;
          longestTimeline.length = v.time.length
        }
      });
      const timeline = timeSeries[longestTimeline.area].time;
      const sortData = arr => arr.sort((a, b) => {
        const vA = a.data;
        const vB = b.data;
        if (vA < vB) {
          return 1;
        } else if (vA > vB) {
          return -1;
        } else {
          return 0;
        }
      });
      const dSort = sortData(Object.entries(timeSeries).map(([k, v]) => ({
        name: k,
        data: v.confirmed[v.confirmed.length - 1],
        label: getFormatMessage(`area.${k}`, locale, k),
      })));
      const otherLabel = locale === 'en' ? 'OtherArea' : '其他地区';
      batch(() => {
        setDataLabel(dSort);
        setRenderData(timeline.map((t, i) => ({
          time: getFormattedDateYYYYMMDD(t),
          ...dSort.slice(0, 11).reduce((acc, cur) => ({ ...acc, [cur.label]: timeSeries[cur.name].confirmed[i] }), {}),
          ...dSort.slice(11).reduce((acc, cur) => ({ otherLabel: acc[otherLabel] + timeSeries[cur.name].confirmed[i] }), { [otherLabel]: 0 }),
        })));
      });
    }
  }, [isLoading, timeSeries, locale]);

  return (
    <Card loading={isLoading}>
      <Meta
        title={
          <h6>
            {getFormattedMessage('chart.title')}
          </h6>
        }
        description={
          <ResponsiveContainer width='100%' height={600}>
            <LineChart
              data={renderData}
              margin={{ top: 16, right: 10, bottom: 4, left: -10 }}
            >
              <XAxis
                type='category'
                dataKey="time"
                tickSize={5}
                padding={{ right: 10 }}
              />
              <YAxis
                tickFormatter={t => t === 1 ? 0 : t >= 1000 ? `${(t / 1000)}k` : t}
                scale='log'
                domain={[1, 1000000]}
                allowDataOverflow
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  border: 'none',
                }}
              />
              <Legend />
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              {dataLabel.slice(0, 11).map(d =>
                <Line
                  key={`line-char-${d.name}`}
                  type="natural"
                  dataKey={d.label}
                  stroke={getRandomColor()}
                  strokeWidth={2}
                  dot={false}
                />
              )}
              <Line
                key={'line-char-OtherArea'}
                type="natural"
                dataKey={locale === 'en' ? 'OtherArea' : '其他地区'}
                stroke={getRandomColor()}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        }
      />
    </Card>
  )
}

export default WorldwideChart;