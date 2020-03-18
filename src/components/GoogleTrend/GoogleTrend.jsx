import React from 'react';
import Script from 'react-load-script';

const GoogleTrend = props => {

  const handleScriptLoad = ({ type, keyword }) => {
    window.trends.embed.renderExploreWidgetTo(
      document.getElementById('home-tab-tabpane-gt'),
      type,
      {
        comparisonItem: [{ keyword, geo: 'US', time: 'today 12-m' }],
        category: 0,
        property: ''
      },
      {
        exploreQuery: `q=${encodeURI(keyword)}&geo=US&date=today 12-m`,
        guestPath: 'https://trends.google.com:443/trends/embed/'
      }
    );
  };

  return (
    <div className="google-trend-chart">
      <Script
        url="https://ssl.gstatic.com/trends_nrtr/2051_RC11/embed_loader.js"
        onLoad={() => handleScriptLoad({
          type: "TIMESERIES",
          keyword: "Corona Virus",
        })}
      />
      <Script
        url="https://ssl.gstatic.com/trends_nrtr/2051_RC11/embed_loader.js"
        onLoad={() => handleScriptLoad({
          type: "GEO_MAP",
          keyword: "Corona Virus",
        })}
      />
    </div>
  );
}

export default GoogleTrend;