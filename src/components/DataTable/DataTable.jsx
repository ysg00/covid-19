import React, { useState } from 'react';
import { Table, Card, Input, Row, Col } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { useSelector } from 'react-redux';

import './DataTable.scss';

const DataTable = props => {
  const latestUpdate = useSelector(state => state.latestUpdate);
  const isLoading = useSelector(state => state.isLoading);
  const [areaInput, setAreaInput] = useState('');
  const [isLoadingScript, setIsLodingScript] = useState(false);
  const GoogleTrendTarget = 'google-trend-target';
  const { Meta } = Card;
  const dataSource = Object.entries(latestUpdate).map(([k, v], i) => ({
    key: `${i}`,
    area: k,
    confirmed: v.confirmed,
    increment: v.increment.confirmed,
    recovered: v.recovered,
    deaths: v.deaths,
  }));

  // const getColumnSearchProps = dataIndex => ({
  //   filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
  //     <div style={{ padding: 8 }}>
  //       <Input
  //         ref={node => {
  //           this.searchInput = node;
  //         }}
  //         placeholder={`Search ${dataIndex}`}
  //         value={selectedKeys[0]}
  //         onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
  //         onPressEnter={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
  //         style={{ width: 188, marginBottom: 8, display: 'block' }}
  //       />
  //       <Button
  //         type="primary"
  //         onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
  //         icon={<SearchOutlined />}
  //         size="small"
  //         style={{ width: 90, marginRight: 8 }}
  //       >
  //         Search
  //       </Button>
  //       <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
  //         Reset
  //       </Button>
  //     </div>
  //   ),
  //   filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
  //   onFilter: (value, record) =>
  //     record[dataIndex]
  //       .toString()
  //       .toLowerCase()
  //       .includes(value.toLowerCase()),
  //   onFilterDropdownVisibleChange: visible => {
  //     if (visible) {
  //       setTimeout(() => this.searchInput.select());
  //     }
  //   },
  //   render: text =>
  //     this.state.searchedColumn === dataIndex ? (
  //       <Highlighter
  //         highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
  //         searchWords={[this.state.searchText]}
  //         autoEscape
  //         textToHighlight={text.toString()}
  //       />
  //     ) : (
  //       text
  //     ),
  // });

  const columns = [
    {
      title: 'Area',
      dataIndex: 'area',
      key: 'area',
      sorter: (a, b) => a.area.localeCompare(b.area),
      sortDirections: ['ascend', 'descend'],
      ellipsis: true,
      className: 'table-column',
    },
    {
      title: 'Confirmed',
      dataIndex: 'confirmed',
      key: 'confirmed',
      sorter: (a, b) => a.confirmed - b.confirmed,
      defaultSortOrder: 'descend',
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
  ];


  return (
    <Card loading={isLoading || isLoadingScript}>
      <Meta 
        title='Meta Data Card'
        description={
          <Table
            classNaame='data-table'
            loading={isLoading}
            dataSource={dataSource}
            columns={columns}
            pagination={false}
            // pagination={{
            //   size: 'small',
            //   position: 'top',
            //   showTotal: total => `Total ${total} Countries`,
            // }}
            scroll={{ y: 480 }}
          />
        }
      />
    </Card>
  );
};

export default DataTable;
