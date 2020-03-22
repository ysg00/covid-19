import React from 'react';
import { List } from 'antd';
import { useSelector } from 'react-redux';

const OpenLayerMapSideBar = props => {
  const features = useSelector(state => state.features);
  const isLoading = useSelector(state => state.isLoading);
  const propGetter = obj => {
    const dLen = obj.properties.confirmed.length;
    return obj.properties.confirmed[dLen - 1].count;
  }

  const sortFeature = arr => arr.sort((a, b) => {
    const vA = propGetter(a);
    const vB = propGetter(b);
    if (vA < vB) {
        return 1;
    } else if (vA > vB) {
        return -1;
    } else {
        return 0;
    }
  });

  return (
    <List
      className='data-list'
      bordered='true'
      loading={isLoading}
      itemLayout='horizontal'
      dataSource={sortFeature(features)}
      size='small'
      scroll={{ y: 480 }}
      renderItem={item => {
        const dLen = item.properties.confirmed.length;
        const { country, province } = item.properties;
        return (
          <List.Item
            id={`data-list-item-${country}-${province}`}
          >
            <List.Item.Meta
              title={province === '' ? `${country}` : `${province}, ${country}`}
              description={
                <>
                  <h6>
                    {`confirmed: ${item.properties.confirmed[dLen - 1].count}`}
                  </h6>
                  <h6>
                    {`recovered: ${item.properties.recovered[dLen - 1].count}`}
                  </h6>
                  <h6>
                    {`deaths: ${item.properties.deaths[dLen - 1].count}`}
                  </h6>
                </>
              }
            />
          </List.Item>
        );
      }}
    />
  );
};

export default OpenLayerMapSideBar;
