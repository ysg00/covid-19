
import React, { useState, useEffect } from 'react';
import { Table, Card, Popover, Button, Select, Row, Col } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useSelector, batch } from 'react-redux';
import moment from 'moment';
// import DataTableChart from './DataTableChart';
import getMsg from '../../utils/getFormattedMessage';

// import './DataTable.scss';

const OpenLayerMapSideBar = props => {
  const latestUpdate = useSelector(state => state.latestUpdate);
  const isLoading = useSelector(state => state.isLoading);
  const timeSeries = useSelector(state => state.timeSeries);
  const features = useSelector(state => state.features);
  const [renderData, setRenderData] = useState([]);
  const { Meta } = Card;
  const { Option } = Select;

  const columns = [
    {
      title: getMsg('table.header.area'),
      dataIndex: 'area',
      key: 'area',
    }
  ];

  useEffect(() => {
    if (!isLoading) {
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
      setRenderData(sortFeature(features).map(obj => {
        const { country, province, confirmed, recovered, deaths } = obj.properties;
        const dLen = confirmed.length;
        return {
          key: `list-${country}`,
          area: (
            <>
              <h6>{province ? `${province}, ` : null}{getMsg(`country.${country}`, {}, country)}</h6>
              <span>{getMsg('global.confirmed')}: {confirmed[dLen-1]}</span><br />
              <span>{getMsg('global.recovered')}: {recovered[dLen-1]}</span><br />
              <span>{getMsg('global.deaths')}: {deaths[dLen-1]}</span><br />
            </>
          ),
        }
      }));
    }
  }, [isLoading, latestUpdate, timeSeries]);
  return (
    <Card loading={isLoading} bodyStyle={{ height: '1080px' }}>
      <Meta
        description={
          <Table
            loading={isLoading}
            dataSource={renderData}
            columns={columns}
            pagination={false}
            showHeader={false}
            scroll={{ y: 480 }}
          />
        }
      />
    </Card>
  );
};

export default OpenLayerMapSideBar;
