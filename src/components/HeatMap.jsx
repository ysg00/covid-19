import React, { useState, useEffect } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import GeoJSON from 'ol/format/GeoJSON';
import {Tile, Group, Vector} from 'ol/layer';
import {OSM, Vector as VectorSource} from 'ol/source';
import {Circle, Fill, Style} from 'ol/style';
import Overlay from 'ol/Overlay';
import { fromLonLat } from 'ol/proj';
import c3 from 'c3';
import { batch } from 'react-redux';
import { get, range } from 'lodash';

 
import './HeatMap.scss';

const HeatMap = props => {
  const [curCoor, setCurCoor] = useState(undefined);
  const [sdata, setSdata] = useState({});
  useEffect(() => {
    if (curCoor) {
      const confirmedLabel = 'Confirmed';
      const recoveredLabel = 'Recovered';
      const deathLabel = 'Deaths';
      const total = [...sdata.confirmed, ...sdata.recovered, ...sdata.deaths]
      const yMax = Math.max(...total);
      const yRange = range(0, yMax, Math.floor((yMax)/3))
      c3.generate({
        bindto: '#case-chart',
        size: {
          height: 150,
          width: 200,
        },
        data: {
          x: 'x',
          columns: [
            ['x', ...sdata.time],
            [confirmedLabel, ...sdata.confirmed],
            [recoveredLabel, ...sdata.recovered],
            [deathLabel, ...sdata.deaths],
          ],
          types: {
            [confirmedLabel]: 'line',
            [recoveredLabel]: 'line',
            [deathLabel]: 'line',
          },
          colors: {
            [confirmedLabel]: '#FF6E6D',
            [recoveredLabel]: '#66B46A',
            [deathLabel]: '#DDDDDD',
          },
        },
        point: {
          show: false,
        },
        axis: {
          x: {
            type: 'category',
            tick: {
              show: false,
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
              count: 4,
              values: yRange,
            },
          },
        },
        tooltip: {
          position(data, width, height, element) {
            const elemHeight = get(element, 'height.baseVal.value');
            return {
              top: elemHeight - 100,
              left: 210,
            };
          },
        },
        legend: {
          show: false,
        },
      });
    }
  }, [sdata, curCoor])
  useEffect(() => {
    const getColor = {
      deaths: 'rgb(0,0,0, 0.5)',
      recovered: 'rgb(0,255,0, 0.3)',
      confirmed: 'rgb(255,0,0, 0.3)', 
    };
    const createStyle = (feature, resolution) => {
      const radiusFactor = Math.log10(maxResolution / resolution) * 0.5 + 1;
      // const country = feature.get('country');
      // const province = feature.get('province');
      
      const lastIndex = feature.get('confirmed').length - 1;
      const confirmed = feature.get('confirmed')[lastIndex].count;
      const recovered = feature.get('recovered')[lastIndex].count;
      const deaths = feature.get('deaths')[lastIndex].count;
    
      let confirmedRadius = Math.log10(confirmed + 1) * 10;
      let recoveredRadius = Math.sqrt((recovered + deaths) / confirmed) * confirmedRadius;
      let deathsRadius = Math.sqrt(deaths / confirmed) * confirmedRadius;
      confirmedRadius *= radiusFactor;
      recoveredRadius *= radiusFactor;
      deathsRadius *= radiusFactor;
      return [
        new Style({
          image: new Circle({
            radius: confirmedRadius,
            fill: new Fill({
              color: getColor['confirmed']
            })
          })
        }),
        new Style({
          image: new Circle({
            radius: recoveredRadius,
            fill: new Fill({
              color: getColor['recovered']
            })
          })
        }),
        new Style({
          image: new Circle({
            radius: deathsRadius,
            fill: new Fill({
              color: getColor['deaths']
            })
          })
        })
      ];
    }
    var popup = new Overlay({
      element: document.getElementById('jhu-map-popup'),
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      }
    });
    
    var map = new Map({
      target: 'map',
      layers: [
        new Group({
          title: 'Base maps',
          openInLayerSwitcher: true,
          layers: [
            new Tile({
              title: 'Open Street',
              baseLayer: true,
              source: new OSM()
            })
          ]
        }),
        new Vector({
          title: 'COVID-19 cases',
          source: new VectorSource({
            format: new GeoJSON(),
            url: 'http://localhost:3000/geodata.json',
          }),
          style: function(feature, resolution){
            return createStyle(feature, resolution);
          }
        })
      ],
      view: new View({
        center: fromLonLat([-100, 35]),
        zoom: 4,
      }),
      overlays: [popup],
    });
    var view = map.getView();
    var maxResolution = view.getResolution();
    
    map.on('pointermove', function(evt){
      map.getTargetElement().style.cursor = map.hasFeatureAtPixel(evt.pixel) ? 'pointer' : '';
    });
    map.on('singleclick', function(evt){
      var feature = map.forEachFeatureAtPixel(evt.pixel, function(feature, layer){
        return feature;
      });
      if(feature){
        window.location.hash = 'feature-' + feature.getId();
        showFeatureStats(feature, evt.coordinate);
      }else{
        popup.setPosition(undefined);
      }
    });

    var calculateStats = function(feature, all=false){
      var country = feature.get ? feature.get('country') : feature.properties.country;
      var province = feature.get ? feature.get('province') : feature.properties.province;
      var confirmed = feature.get ? feature.get('confirmed') : feature.properties.confirmed;
      var recovered = feature.get ? feature.get('recovered') : feature.properties.recovered;
      var deaths = feature.get ? feature.get('deaths') : feature.properties.deaths;
    
      var time = [];
      var confirmedCounts = [];
      var recoveredCounts = [];
      var deathsCounts = [];
    
      for(var i = 0; i <= confirmed.length - 1; i++){
        var c = confirmed[i].count;
        var r = recovered[i].count;
        var d = deaths[i].count;
        if(all || time.length || c || r || d){
          time.push(confirmed[i].time.replace(/\//g, '-').replace(/ .*/, ''));
          confirmedCounts.push(c);
          recoveredCounts.push(r);
          deathsCounts.push(d);
        }
      }
    
      return {
        country: country,
        province: province,
        lastUpdated: Date.parse(confirmed[confirmed.length-1].time),
        time: time,
        confirmed: confirmedCounts,
        recovered: recoveredCounts,
        deaths: deathsCounts
      };
    };
    
    var showFeatureStats = function(feature, coor){
      var stats = calculateStats(feature);
      showPopup(stats, coor);
    };
    
    var showPopup = function(stats, coor){
      var lastUpdated = stats.lastUpdated;
      var lastIndex = stats.confirmed.length - 1;
      var lastConfirmed = stats.confirmed[lastIndex];
      var lastRecovered = stats.recovered[lastIndex];
      var lastDeaths = stats.deaths[lastIndex];
    
      if(lastConfirmed) lastConfirmed = lastConfirmed.toLocaleString();
      if(lastRecovered) lastRecovered = lastRecovered.toLocaleString();
      if(lastDeaths) lastDeaths = lastDeaths.toLocaleString();
    
      var name = stats.province ? stats.province + ', ' + stats.country : stats.country;
      document.getElementById('jhu-map-popup-content').innerHTML =
        '<h5>' + name + '</h5>' +
        '<div id="popup-last-updated">' + new Date(lastUpdated).toLocaleString() + '</div>' +
        '<table id="popup-stats">' +
        (lastConfirmed ? '<tr class="confirmed"><td>Confirmed:</td><td class="right">' + lastConfirmed + '</td></tr>' : '') +
        (lastRecovered ? '<tr class="recovered"><td>Recovered:</td><td class="right">' + lastRecovered + '</td></tr>' : '') +
        (lastDeaths ? '<tr class="deaths"><td>Deaths:</td><td class="right">' + lastDeaths + '</td></tr>' : '') +
        '</table>' + 
        '<div id="case-chart" class="case-chart" />';
      batch(() => {
        setCurCoor(coor);
        setSdata(stats);
      })
      popup.setPosition(coor);
    }
  }, []);

  return (
    <div className="map">
      <div id="map" className="map" />
      <div id="jhu-map-popup" className="ol-popup">
        <div id="jhu-map-popup-content" />
      </div>
    </div>

  );
}

export default HeatMap;
