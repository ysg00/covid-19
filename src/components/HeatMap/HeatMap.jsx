import React, { useState, useEffect } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import GeoJSON from 'ol/format/GeoJSON';
import { Tile, Group, Vector } from 'ol/layer';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Circle, Fill, Style } from 'ol/style';
import Overlay from 'ol/Overlay';
import { fromLonLat } from 'ol/proj';
import { batch, useSelector } from 'react-redux';
import moment from 'moment';
import MapPopup from './HeatMapPopup';
import { Card } from 'antd';
import './HeatMap.scss';

const HeatMap = props => {
  const [curCoor, setCurCoor] = useState(undefined);
  const [sdata, setSdata] = useState({});
  const [renderData, setRenderData] = useState('');
  const isLoading = useSelector(state => state.isLoading);
  const features = useSelector(state => state.features);
  const { Meta } = Card;
  useEffect(() => {
    if (!isLoading) {
      const getColor = {
        deaths: 'rgb(0,0,0, 0.5)',
        recovered: 'rgb(0,255,0, 0.3)',
        confirmed: 'rgb(255,0,0, 0.3)',
      };
      const popup = new Overlay({
        element: document.getElementById('map-popup'),
        autoPan: true,
        autoPanAnimation: {
          duration: 250,
        }
      });
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
              }),
            }),
          }),
          new Style({
            image: new Circle({
              radius: recoveredRadius,
              fill: new Fill({
                color: getColor['recovered']
              }),
            }),
          }),
          new Style({
            image: new Circle({
              radius: deathsRadius,
              fill: new Fill({
                color: getColor['deaths']
              }),
            }),
          }),
        ];
      };
      const calculateStats = (feature, all = false) => {
        const country = feature.get ? feature.get('country') : feature.properties.country;
        const province = feature.get ? feature.get('province') : feature.properties.province;
        const confirmed = feature.get ? feature.get('confirmed') : feature.properties.confirmed;
        const recovered = feature.get ? feature.get('recovered') : feature.properties.recovered;
        const deaths = feature.get ? feature.get('deaths') : feature.properties.deaths;
        const time = [];
        const confirmedCounts = [];
        const recoveredCounts = [];
        const deathsCounts = [];
  
        for (let i = 0; i <= confirmed.length - 1; i++) {
          const c = confirmed[i].count;
          const r = recovered[i].count;
          const d = deaths[i].count;
          if (all || time.length || c || r || d) {
            // time.push(confirmed[i].time.replace(/\//g, '-').replace(/ .*/, ''));
            time.push(moment(confirmed[i].time).format('YYYY-MM-DD'))
            confirmedCounts.push(c);
            recoveredCounts.push(r);
            deathsCounts.push(d);
          }
        };
  
        return {
          country: country,
          province: province,
          lastUpdated: Date.parse(confirmed[confirmed.length - 1].time),
          time: time,
          confirmed: confirmedCounts,
          recovered: recoveredCounts,
          deaths: deathsCounts
        };
      };
  
      const showFeatureStats = (feature, coor) => {
        showPopup(calculateStats(feature), coor);
      };
  
      const showPopup = (stats, coor) => {
        const lastIndex = stats.confirmed.length - 1;
        const lastConfirmed = stats.confirmed[lastIndex];
        const lastRecovered = stats.recovered[lastIndex];
        const lastDeaths = stats.deaths[lastIndex];
        batch(() => {
          setCurCoor(coor);
          setSdata(stats);
          setRenderData({
            lastConfirmed,
            lastRecovered,
            lastDeaths,
          });
        });
        popup.setPosition(coor);
      }
      const geoJsonType = new GeoJSON();
      const vectorSource = new VectorSource({
        format: geoJsonType,
        features: geoJsonType.readFeatures({ type: 'FeatureCollection', features }, { featureProjection: 'EPSG:3857' })
      });
      const map = new Map({
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
            source: vectorSource,
            style: (feature, resolution) => {
              return createStyle(feature, resolution);
            }
          }),
        ],
        view: new View({
          center: fromLonLat([-100, 35]),
          zoom: 2,
        }),
        overlays: [popup],
      });
      const view = map.getView();
      const maxResolution = view.getResolution();
      map.on('pointermove', (evt) => {
        map.getTargetElement().style.cursor = map.hasFeatureAtPixel(evt.pixel) ? 'pointer' : '';
      });
      map.on('singleclick', (evt) => {
        const feature = map.forEachFeatureAtPixel(evt.pixel, (feature, _) => feature);
        if (feature) {
          window.location.hash = 'feature-' + feature.getId();
          showFeatureStats(feature, evt.coordinate);
        } else {
          popup.setPosition(undefined);
        }
      });
    }
  }, [isLoading, features]);

  return (
    <Card loading={isLoading}>
      {isLoading
        ? null
        : <Meta description={
          <>
            <div id='map' className='heat-map' />
            {curCoor
              ? <div id='map-popup' className='ol-popup'>
                <MapPopup sdata={sdata} coor={curCoor} renderData={renderData} />
              </div>
              : <div id='map-popup' />
            }
          </>
        }/>
      }
    </Card>
  );
};

export default HeatMap;
