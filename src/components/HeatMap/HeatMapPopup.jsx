import React from 'react';
import { Card } from 'antd';
import Plot from 'react-plotly.js';

const HeatMapPopup = props => {
  const { sdata, renderData: {
    lastConfirmed,
    lastRecovered,
    lastDeaths,
  } } = props;
  const { Meta } = Card;

  return (
    <Card
      bodyStyle={{ padding: '5px 10px' }}
    >
      <Meta
        title={sdata.province ? `${sdata.province}, ${sdata.country}` : sdata.country}
        description={
          <div>
            <h6>Lastest Update:</h6>
            <h6>{`${new Date(sdata.lastUpdated).toLocaleString()}`}</h6>
            {lastConfirmed ? <h5>{`Confirmed: ${lastConfirmed.toLocaleString()}`}</h5> : null}
            {lastRecovered ? <h5>{`Recoverd: ${lastRecovered.toLocaleString()}`}</h5> : null}
            {lastDeaths ? <h5>{`Deaths: ${lastDeaths.toLocaleString()}`}</h5> : null}
            <Plot
              data={[
                {
                  x: [...sdata.time],
                  y: [...sdata.confirmed],
                  name: 'Confirmed',
                  type: 'scatter',
                  mode: 'lines',
                  marker: { color: '#FF6E6D' },
                },
                {
                  x: [...sdata.time],
                  y: [...sdata.recovered],
                  name: 'Recovered',
                  type: 'scatter',
                  mode: 'lines',
                  marker: { color: '#66B46A' },
                },
                {
                  x: [...sdata.time],
                  y: [...sdata.deaths],
                  name: 'Deaths',
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

export default HeatMapPopup;