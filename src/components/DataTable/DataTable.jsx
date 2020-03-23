import React, { useState, useEffect } from 'react';
import { Table, Card, Popover, Button, Select, Row, Col } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useSelector, batch } from 'react-redux';
import moment from 'moment';
import DataTableChart from './DataTableChart';
import getMsg from '../../utils/getFormattedMessage';

import './DataTable.scss';

const DataTable = props => {
  const latestUpdate = useSelector(state => state.latestUpdate);
  const isLoading = useSelector(state => state.isLoading);
  const timeSeries = useSelector(state => state.timeSeries);
  const [tableData, setTableData] = useState([]);
  const [renderData, setRenderData] = useState([]);
  const { Meta } = Card;
  const { Option } = Select;

  const columns = [
    {
      title: getMsg('table.header.area'),
      dataIndex: 'area',
      key: 'area',
      ellipsis: true,
      className: 'text-nowrap',
    },
    {
      title: getMsg('global.confirmed'),
      dataIndex: 'confirmed',
      key: 'confirmed',
      sorter: (a, b) => a.confirmed - b.confirmed,
      sortDirections: ['descend', 'ascend'],
      className: 'text-nowrap',
    },
    {
      title: getMsg('global.increment'),
      dataIndex: 'increment',
      key: 'increment',
      sorter: (a, b) => a.increment - b.increment,
      sortDirections: ['descend', 'ascend'],
      className: 'text-nowrap',
    },
    {
      title: getMsg('global.recovered'),
      dataIndex: 'recovered',
      key: 'recovered',
      sorter: (a, b) => a.recovered - b.recovered,
      sortDirections: ['descend', 'ascend'],
      className: 'text-nowrap',
    },
    {
      title: getMsg('global.deaths'),
      dataIndex: 'deaths',
      key: 'deaths',
      sorter: (a, b) => a.deaths - b.deaths,
      sortDirections: ['descend', 'ascend'],
      className: 'text-nowrap',
    },
    {
      title: getMsg('table.header.lastupdate'),
      dataIndex: 'lastUpdate',
      key: 'lastUpdate',
      className: 'text-nowrap',
    },
    {
      title: getMsg('table.header.series'),
      dataIndex: 'timeseries',
      key: 'timeseries',
      className: 'text-nowrap',
    },
  ];

  useEffect(() => {
    if (!isLoading) {
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
      const dataSource = sortData(Object.entries(latestUpdate).map(([k, v], i) => ({
        key: `${i}`,
        area: getMsg(`area.${k}`, {}, k),
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
              : getMsg('table.cell.nodata')
            }
          </>
        ),
      })));
      batch(() => {
        setTableData(dataSource);
        setRenderData(dataSource);
      });
    }
  }, [isLoading, latestUpdate, timeSeries]);
  return (
    <Card loading={isLoading} bodyStyle={{ height: '1080px' }}>
      <Meta
        title={
          <Row>
            <Col className='d-flex justify-content-start align-items-center' span={6}>
              <h6 style={{ margin: 0 }}>{getMsg('table.title.countrynum', { v1: Object.keys(latestUpdate).length })}</h6>
            </Col>
            <Col span={18}>
              <Select
                showSearch
                bordered={false}
                placeholder={getMsg('table.select.placeholder')}
                style={{
                  width: '100%',
                }}
                onSelect={v => v === ''
                  ? setRenderData(tableData)
                  : setRenderData([{
                    key: `single-data-${v}`,
                    area: getMsg(`area.${v}`, {}, v),
                    confirmed: latestUpdate[v].confirmed,
                    increment: latestUpdate[v].increment.confirmed,
                    recovered: latestUpdate[v].recovered,
                    deaths: latestUpdate[v].deaths,
                    lastUpdate: moment(latestUpdate[v].lastUpdate).format('YYYY-MM-DD'),
                    timeseries: (
                      <>
                        {timeSeries[v]
                          ? <Popover
                            placement='topRight'
                            content={<DataTableChart {...timeSeries[v]} />} 
                            trigger='click'
                          >
                            <Button shape='circle' icon={<SearchOutlined />} />
                          </Popover>
                          : getMsg('table.cell.nodata')
                        }
                      </>
                    ),
                  }])
                }
              >
                <Option key='Showall' value=''>{getMsg('table.select.showall')}</Option>
                <Option key='Worldwide' value='Worldwide'>{getMsg('area.Worldwide')}</Option>
                {Object.keys(latestUpdate).sort().map(k => 
                  k === 'Worldwide' ? null : <Option key={k} value={k}>{getMsg(`area.${k}`, {}, k)}</Option>
                )}
              </Select>
            </Col>
          </Row>
        }
        description={
          <Table
            classNaame='data-table'
            loading={isLoading}
            dataSource={renderData}
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
