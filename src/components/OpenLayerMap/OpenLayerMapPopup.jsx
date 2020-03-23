import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card } from 'antd';
import Plot from 'react-plotly.js';
import moment from 'moment';
import getMsg from '../../utils/getFormattedMessage';

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
    <Card
      bodyStyle={{ padding: '5px 10px' }}
    >
      <Meta
        title={
          <>
            {sdata.province ? getMsg(`area.${sdata.province}`, {}, sdata.province) : null}
            {sdata.province ? ', ' : null}
            {getMsg(`area.${sdata.country}`, {}, sdata.country)}
          </>
        }
        description={
          <div>
            <h6>{getMsg('map.popup.latestupdate')}:</h6>
            <h6>{moment(new Date(sdata.lastUpdated)).format('YYYY-MM-DD')}</h6>
            {lastConfirmed ? <h5>{`${labels.confirmed}: ${lastConfirmed.toLocaleString()}`}</h5> : null}
            {lastRecovered ? <h5>{`${labels.recovered}: ${lastRecovered.toLocaleString()}`}</h5> : null}
            {lastDeaths ? <h5>{`${labels.deaths}: ${lastDeaths.toLocaleString()}`}</h5> : null}
            <Plot
              data={[
                {
                  x: [...sdata.time],
                  y: [...sdata.confirmed],
                  name: labels.confirmed,
                  type: 'scatter',
                  mode: 'lines',
                  marker: { color: '#FF6E6D' },
                },
                {
                  x: [...sdata.time],
                  y: [...sdata.recovered],
                  name: labels.recovered,
                  type: 'scatter',
                  mode: 'lines',
                  marker: { color: '#66B46A' },
                },
                {
                  x: [...sdata.time],
                  y: [...sdata.deaths],
                  name: labels.deaths,
                  type: 'scatter',
                  mode: 'lines',
                  marker: { color: '#606060' },
                },
              ]}
              layout={{
                width: 200,
                height: 200,
                showlegend: false,
                margin: {
                  l: 30,
                  t: 10,
                  r: 10,
                  b: 24,
                },
                plot_bgcolor: '#f0f2f5',
                paper_bgcolor: '#f0f2f5',
                xaxis: {
                  showticklabels: false,
                },
              }}
              config={{
                displayModeBar: false,
              }}
            />
          </div>
        }
      />
    </Card>
  );
}

export default OpenLayerMapPopup;