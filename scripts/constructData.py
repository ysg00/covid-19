import csv
import requests
import sqlite3
from datetime import datetime, timedelta

def drop_table():
  c.execute('''DROP TABLE CONFIRMED''')
  c.execute('''DROP TABLE RECOVERED''')
  c.execute('''DROP TABLE DEATHS''')

def create_table():
  c.execute('''CREATE TABLE CONFIRMED
    (province blob, country text, lat real, long real, PRIMARY KEY (province, country))''')
  c.execute('''CREATE TABLE RECOVERED
    (province blob, country text, lat real, long real, PRIMARY KEY (province, country))''')
  c.execute('''CREATE TABLE DEATHS
    (province blob, country text, lat real, long real, PRIMARY KEY (province, country))''')

def extend_column(t, d):
  dd = d.split('/')
  dtext = f'2020-0{dd[0]}-{dd[1]}'
  c.execute(f'ALTER TABLE {t} ADD "{dtext}" INTEGER')

def insert_init_data():
  for table, dset in [('CONFIRMED', 'Confirmed'), ('RECOVERED', 'Recovered'), ('DEATHS', 'Deaths')]:
    with open(f'src/data/time_series_19-covid-{dset}.csv') as f:
      cr = list(csv.reader(f, delimiter=','))
      header = cr[0]
      _counrty, _province, _lat, _long, *_date = header
      for d in _date:
        extend_column(table, d)
      data = list(map(tuple, cr[1:]))
      placeholder = ','.join(['?']*len(data[0]))
      c.executemany(f'INSERT INTO {table} VALUES ({placeholder})', data)

def update_new_data():
  with requests.Session() as s:
    d = datetime.strptime('2020-03-24', '%Y-%m-%d')
    while d.strftime('%Y-%m-%d') != datetime.today().strftime('%Y-%m-%d'):
      date = d.strftime('%Y-%m-%d')
      dd = date.split('-')
      date_api = f'{dd[1]}-{dd[2]}-{dd[0]}'
      r = s.get(f'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/{date_api}.csv')
      if r.status_code == 400:
        continue
      cr = csv.reader(r.content.decode('utf-8').splitlines(), delimiter=',')
      c.execute(f'ALTER TABLE CONFIRMED ADD "{date}" INTEGER')
      c.execute(f'ALTER TABLE RECOVERED ADD "{date}" INTEGER')
      c.execute(f'ALTER TABLE DEATHS ADD "{date}" INTEGER')
      condic = {}
      deadic = {}
      recdic = {}
      for row in list(cr)[1:]:
        _, _, _province, _country, _, _, _, con, dea, rec, *_ = row
        if _country == 'US':
          clean_us_data(condic, deadic, recdic, _province, con, dea, rec)
          continue
        for table in ['CONFIRMED', 'RECOVERED', 'DEATHS']:
          dupdate = con
          if table == 'RECOVERED':
            dupdate = rec
          elif table == 'DEATHS':
            dupdate = dea
          try:
            c.execute(f'select * from {table} where country="{_country}" and province="{_province}"')
            second_last_element, last_element = c.fetchone()[-2:]
            if last_element is None:
              c.execute(f'UPDATE {table} SET "{date}"="{int(dupdate)+int(second_last_element)}" where country="{_country}" and province="{_province}"')
            else:
              c.execute(f'UPDATE {table} SET "{date}"="{last_element+dupdate}" where country="{_country}" and province="{_province}"')
          except:
            pass
      for table, dic in [('CONFIRMED', condic), ('RECOVERED', recdic), ('DEATHS', deadic)]:
        for key in dic:
          try:
            c.execute(f'UPDATE {table} SET "{date}"="{dic[key]}" where country="US" and province="{key}"')
          except:
            pass
      d += timedelta(days=1)

def clean_us_data(condic, deadic, recdic, pro, con, dea, rec):
  condic[pro] = condic.get(pro, 0) + int(con)
  deadic[pro] = deadic.get(pro, 0) + int(dea)
  recdic[pro] = recdic.get(pro, 0) + int(rec)

def clean_data():
  for table in ['CONFIRMED', 'RECOVERED', 'DEATHS']:
    c.execute(f'select * from {table}')
    for row in c.fetchall():
      pro, cou, _, _, *data = row
      if row[-1] is None:
        c.execute(f'DELETE FROM {table} WHERE province="{pro}" and country="{cou}"')

def handel_special_case(cou, pro):
  if cou == 'Canada' and pro == 'Recovered':
    return True
  if cou == 'US' and pro == '':
    return True
  return False

def pull_newest_data():
  with requests.Session() as s:
    for table in ['CONFIRMED', 'RECOVERED', 'DEATHS']:
      r = s.get(f'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_{table.lower()}_global.csv')
      cr = csv.reader(r.content.decode('utf-8').splitlines(), delimiter=',')
      for row in list(cr)[1:]:
        pro, cou, _, _, *data = row
        if handel_special_case(cou, pro):
            continue
        try:
          c.execute(f'DELETE FROM {table} WHERE province="{pro}" and country="{cou}"')
          data = [tuple(row)]
          placeholder = ','.join(['?']*len(data[0]))
          c.executemany(f'INSERT INTO {table} VALUES ({placeholder})', data)
        except:
          data = [tuple(row)]
          placeholder = ','.join(['?']*len(data[0]))
          c.executemany(f'INSERT INTO {table} VALUES ({placeholder})', data)

  # for table in ['CONFIRMED', 'RECOVERED', 'DEATHS']:
  #   c.execute(f'select * from {table}')
  #   for row in c.fetchall():
  #     pro, cou, _, _, *data = row
  #     if row[-1] is None:
  #       c.execute(f'UPDATE {table} SET "2020-03-28"="{row[-2]}" where country="{cou}" and province="{pro}"')



def write_csv():
  for table in ['CONFIRMED', 'RECOVERED', 'DEATHS']:
    cursor = c.execute(f'select * from {table}')
    names = [description[0] for description in cursor.description]
    with open(f'src/data/{table.lower()}_timeseries.csv', 'w', newline='') as f:
      w = csv.writer(f, delimiter=',')
      w.writerow(names)
      for row in c.fetchall():
        w.writerow(row)


conn = sqlite3.connect('src/data/sqlite.db')
c = conn.cursor()

drop_table()
create_table()
insert_init_data()
update_new_data()
clean_data()
pull_newest_data()
write_csv()

conn.commit()
conn.close()

