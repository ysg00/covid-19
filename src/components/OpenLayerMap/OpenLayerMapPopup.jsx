import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card } from 'antd';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
} from 'recharts';
import { getFormattedMessage, getFormattedDateYYYYMMDD } from '../../utils/Formatter';

const OpenLayerMapPopup = props => {
  const { sdata, renderData: {
    lastConfirmed,
    lastRecovered,
    lastDeaths,
  } } = props;
  const { Meta } = Card;
  const [labels, setLabels] = useState({
    confirmed: 'Confirmed',
    recovered: 'Recovered',
    deaths: 'Deaths',
  });
  const locale = useSelector(state => state.locale);
  const constructTimeSeriesData = data => data.confirmed.map((_, i) => ({
    time: data.time[i],
    [labels.confirmed]: data.confirmed[i],
    [labels.recovered]: data.recovered[i],
    [labels.deaths]: data.deaths[i],
  }));

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
    <Card
      bodyStyle={{ padding: '5px 10px' }}
    >
      <Meta
        title={
          <>
            {sdata.province ? getFormattedMessage(`area.${sdata.province}`, {}, sdata.province) : null}
            {sdata.province ? ', ' : null}
            {getFormattedMessage(`area.${sdata.country}`, {}, sdata.country)}
          </>
        }
        description={
          <div>
            <h6>{getFormattedMessage('map.popup.latestupdate')}:</h6>
            <h6>{getFormattedDateYYYYMMDD(new Date(sdata.lastUpdated))}</h6>
            {lastConfirmed ? <h5>{`${labels.confirmed}: ${lastConfirmed.toLocaleString()}`}</h5> : null}
            {lastRecovered ? <h5>{`${labels.recovered}: ${lastRecovered.toLocaleString()}`}</h5> : null}
            {lastDeaths ? <h5>{`${labels.deaths}: ${lastDeaths.toLocaleString()}`}</h5> : null}
            <LineChart
              width={260}
              height={200}
              data={constructTimeSeriesData(sdata)}
              margin={{ top: 4, right: 10, bottom: 0, left: -20 }}
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
                  backgroundColor: 'rbga(255, 255, 255, 0)',
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
          </div>
        }
      />
    </Card>
  );
}

export default OpenLayerMapPopup;