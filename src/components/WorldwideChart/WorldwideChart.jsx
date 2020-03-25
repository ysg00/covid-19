import React, { useState, useEffect } from 'react';
import { useSelector, batch } from 'react-redux';
import { Card } from 'antd';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { getFormattedDateYYYYMMDD } from './../../utils/Formatter';

const WorldwideChart = props => {
  const timeSeries = useSelector(state => state.timeSeries);
  const isLoading = useSelector(state => state.isLoading);
  const { Meta } = Card;
  const [sortedData, setSortedData] = useState([]);
  const [renderData, setRenderData] = useState([]);
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
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
      })));
      console.log(sortData(dSort))
      batch(() => {
        setSortedData(dSort);
        setRenderData(timeline.map((t, i) => ({
          time: getFormattedDateYYYYMMDD(t),
          ...dSort.slice(0, 11).reduce((acc, cur) => ({ ...acc, [cur.name]: timeSeries[cur.name].confirmed[i] }), {}),
          ...dSort.slice(11).reduce((acc, cur) => ({ OtherArea: acc.OtherArea + timeSeries[cur.name].confirmed[i] }), { OtherArea: 0 }),
        })));
      });
    }
  }, [isLoading, timeSeries]);

  return (
    <Card loading={isLoading}>
      <Meta
        description={
          <ResponsiveContainer width='80%' height={600}>
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
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  border: 'none',
                }}
              />
              <Legend />
              <CartesianGrid vertical={false} />
              {sortedData.slice(0, 11).map(d =>
                <Line
                  key={`line-char-${d.name}`}
                  type="natural"
                  dataKey={d.name}
                  stroke={getRandomColor()}
                  strokeWidth={2}
                  dot={false}
                  name={d.name}
                />
              )}
              <Line
                key={'line-char-OtherArea'}
                type="natural"
                dataKey='OtherArea'
                stroke={getRandomColor()}
                strokeWidth={2}
                dot={false}
                name={'OtherArea'}
              />
            </LineChart>
          </ResponsiveContainer>
        }
      />
    </Card>
  )
}

export default WorldwideChart;