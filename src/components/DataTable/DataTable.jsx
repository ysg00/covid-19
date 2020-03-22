import React, { useState, useEffect } from 'react';
import { Table, Card, Popover, Button, Input, Row, Col } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { useSelector, batch } from 'react-redux';
import moment from 'moment';
import DataTableChart from './DataTableChart';

import './DataTable.scss';

const DataTable = props => {
  const latestUpdate = useSelector(state => state.latestUpdate);
  const isLoading = useSelector(state => state.isLoading);
  const timeSeries = useSelector(state => state.timeSeries);
  const [dataTableInput, setDataTableInput] = useState('');
  const { Meta } = Card;

  const sortData = arr => arr.sort((a, b) => {
    const vA = a.confirmed;
    const vB = b.confirmed;
    if (vA < vB) {
        return 1;
    } else if (vA > vB) {
        return -1;
    } else {
        return 0;
    }
  });

  const dataSource = Object.entries(latestUpdate).map(([k, v], i) => ({
    key: `${i}`,
    area: k,
    confirmed: v.confirmed,
    increment: v.increment.confirmed,
    recovered: v.recovered,
    deaths: v.deaths,
    lastUpdate: moment(v.lastUpdate).format('YYYY-MM-DD'),
    timeseries: (
      <>
        {timeSeries[k]
          ? <Popover
            placement='topRight'
            content={<DataTableChart {...timeSeries[k]} />} 
            trigger='click'
          >
            <Button shape='circle' icon={<SearchOutlined />} />
          </Popover>
          : 'No Time Series Data Avaiable'
        }
      </>

    ),
  }));

  const columns = [
    {
      title: 'Area',
      dataIndex: 'area',
      key: 'area',
      sorter: (a, b) => a.area.localeCompare(b.area),
      sortDirections: ['ascend', 'descend'],
      ellipsis: true,
      className: 'table-column',
      onFilter: (val, record) =>
        record['area']
          .toString()
          .toLowerCase()
          .includes(val.toLowerCase()),
      render: text => (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[dataTableInput]}
          autoEscape
          textToHighlight={text.toString()}
        />
      ),
    },
    {
      title: 'Confirmed',
      dataIndex: 'confirmed',
      key: 'confirmed',
      sorter: (a, b) => a.confirmed - b.confirmed,
      sortDirections: ['descend', 'ascend'],
      className: 'table-column',
    },
    {
      title: 'Increment',
      dataIndex: 'increment',
      key: 'increment',
      sorter: (a, b) => a.increment - b.increment,
      sortDirections: ['descend', 'ascend'],
      className: 'table-column',
    },
    {
      title: 'Recovered',
      dataIndex: 'recovered',
      key: 'recovered',
      sorter: (a, b) => a.recovered - b.recovered,
      sortDirections: ['descend', 'ascend'],
      className: 'table-column',
    },
    {
      title: 'Deaths',
      dataIndex: 'deaths',
      key: 'deaths',
      sorter: (a, b) => a.deaths - b.deaths,
      sortDirections: ['descend', 'ascend'],
      className: 'table-column',
    },
    {
      title: 'LastUpdate',
      dataIndex: 'lastUpdate',
      key: 'lastUpdate',
      className: 'table-column',
    },
    {
      title: 'Series',
      dataIndex: 'timeseries',
      key: 'timeseries',
      className: 'table-column',
      width: 100,
    },
  ];

  return (
    <Card loading={isLoading} bodyStyle={{ height: '1080px' }}>
      <Meta
        title={
          <Row>
            <Col className='d-flex justify-content-start align-items-center' span={4}>
              <h6 style={{ margin: 0 }}>{`Total ${Object.keys(latestUpdate).length} Countries`}</h6>
            </Col>
            <Col>
              <Input
                allowClear
                placeholder='Search Country'
                value={dataTableInput}
                suffix={<SearchOutlined />}
                onChange={e => setDataTableInput(e.target.value)}
              />
            </Col>
          </Row>
        }
        description={
          <Table
            classNaame='data-table'
            loading={isLoading}
            dataSource={sortData(dataSource)}
            columns={columns}
            pagination={false}
            scroll={{ y: 920 }}
          />
        }
      />
    </Card>
  );
};

export default DataTable;
