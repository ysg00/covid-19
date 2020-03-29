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

def update_new_data(st, et, data_range):
  with requests.Session() as s:
    d = st
    while d.strftime('%Y-%m-%d') != et.strftime('%Y-%m-%d'):
      date = d.strftime('%Y-%m-%d')
      dd = date.split('-')
      date_api = f'{dd[1]}-{dd[2]}-{dd[0]}'
      r = s.get(f'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/{date_api}.csv')
      if r.status_code >= 300:
        d += timedelta(days=1)
        continue
      print(date)
      cr = csv.reader(r.content.decode('utf-8').splitlines(), delimiter=',')
      c.execute(f'ALTER TABLE CONFIRMED ADD "{date}" INTEGER')
      c.execute(f'ALTER TABLE RECOVERED ADD "{date}" INTEGER')
      c.execute(f'ALTER TABLE DEATHS ADD "{date}" INTEGER')
      condic, deadic, recdic = {}, {}, {}
      _lat, _long = 0.0, 0.0
      for row in list(cr)[1:]:
        pro, cou, _, con, dea, rec, *_ = row
        if data_range == 2:
          pro, cou, _, con, dea, rec, _lat, _long = row
        elif data_range == 3:
          _, _, pro, cou, _, _lat, _long, con, dea, rec, *_ = row
        if cou == 'Mainland China':
          cou = 'China'
        if cou == 'US':
          clean_us_data(condic, deadic, recdic, pro, con, dea, rec)
          continue
        for table in ['CONFIRMED', 'RECOVERED', 'DEATHS']:
          dupdate = con
          if table == 'RECOVERED':
            dupdate = rec
          elif table == 'DEATHS':
            dupdate = dea
          try:
            c.execute(f'select * from {table} where country="{cou}" and province="{pro}"')
            second_last_element, last_element = c.fetchone()[-2:]
            if data_range == 1:
              c.execute(f'UPDATE {table} SET "{date}"="{dupdate}" where country="{cou}" and province="{pro}"')
            else:
              c.execute(f'''UPDATE {table}
                SET "{date}"="{dupdate}", lat="{_lat}", long="{_long}"
                where country="{cou}" and province="{pro}"''')
          except:
            try:
              if date == '2020-01-22':
                c.execute(f'''INSERT INTO {table} (province, country, "{date}")
                  VALUES ("{pro}", "{cou}", "{dupdate}")''')
              else:
                dstr, dval = date_to_start(date, dupdate)
                c.execute(f'''INSERT INTO {table} (province, country, {dstr})
                  VALUES ("{pro}", "{cou}", {dval})''')
            except BaseException as e:
              print(1, cou, pro)
              print(e)
      for table, dic in [('CONFIRMED', condic), ('RECOVERED', recdic), ('DEATHS', deadic)]:
        for key in dic:
          try:
            c.execute(f'UPDATE {table} SET "{date}"="{dic[key]}" where country="US" and province="{key}"')
          except:
            try:
              if date == '2020-01-22':
                c.execute(f'''INSERT INTO {table} (province, country, "{date}")
                  VALUES ("{key}", "US", "{dic[key]}")''')
              else:
                dstr, dval = date_to_start(date, dic[key])
                c.execute(f'''INSERT INTO {table} (province, country, {dstr})
                  VALUES ("{key}", "US", {dval})''')
            except BaseException as e:
              print(2, cou, pro)
              print(e)
      d += timedelta(days=1)

def date_to_start(d, v):
  date_format = '%Y-%m-%d'
  date = datetime.strptime(d, date_format)
  ret = [date.strftime(date_format)]
  val = [str(v)]
  while date.strftime(date_format) != '2020-01-22':
    date -= timedelta(days=1)
    ret.append(date.strftime(date_format))
    val.append('0')
  return '"'+ '", "'.join(ret) + '"', '"'+ '", "'.join(val) + '"'

def clean_us_data(condic, deadic, recdic, pro, con, dea, rec):
  con = int(con) if con != '' else 0
  dea = int(dea) if dea != '' else 0
  rec = int(rec) if rec != '' else 0
  condic[pro] = condic.get(pro, 0) + con
  deadic[pro] = deadic.get(pro, 0) + dea
  recdic[pro] = recdic.get(pro, 0) + rec

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
          try:
            c.execute(f'DELETE FROM {table} WHERE province="{pro}" and country="{cou}"')
          except:
            pass
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

def write_csv():
  for table in ['CONFIRMED', 'RECOVERED', 'DEATHS']:
    cursor = c.execute(f'select * from {table}')
    names = [description[0] for description in cursor.description]
    with open(f'{table.lower()}_timeseries.csv', 'w', newline='') as f:
      w = csv.writer(f, delimiter=',')
      w.writerow(names)
      for row in c.fetchall():
        w.writerow(row)

conn = sqlite3.connect('sqlite.db')
c = conn.cursor()

drop_table()
create_table()

st = datetime.strptime('2020-01-22', '%Y-%m-%d')
et = datetime.strptime('2020-03-01', '%Y-%m-%d')
update_new_data(st, et, 1)

st = datetime.strptime('2020-03-01', '%Y-%m-%d')
et = datetime.strptime('2020-03-22', '%Y-%m-%d')
update_new_data(st, et, 2)

st = datetime.strptime('2020-03-22', '%Y-%m-%d')
et = datetime.today()

update_new_data(st, et, 3)
clean_data()
pull_newest_data()
write_csv()

conn.commit()
conn.close()

