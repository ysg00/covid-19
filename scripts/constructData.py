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

def format_date(d):
  dd = d.split('/')
  month = dd[0] if int(dd[0]) >= 10 else f'0{dd[0]}'
  day = dd[1] if int(dd[1]) >= 10 else f'0{dd[1]}'
  return f'2020-{month}-{day}'

def insert_init_data():
  for table, dset in [('CONFIRMED', 'Confirmed'), ('RECOVERED', 'Recovered'), ('DEATHS', 'Deaths')]:
    with open(f'scripts/data/time_series_19-covid-{dset}.csv') as f:
      cr = list(csv.reader(f, delimiter=','))
      header = cr[0]
      _counrty, pro, _lat, _long, *_date = header
      for d in _date:
        c.execute(f'ALTER TABLE {table} ADD "{format_date(d)}" INTEGER')
      data = list(map(tuple, cr[1:]))
      placeholder = ','.join(['?']*len(data[0]))
      c.executemany(f'INSERT INTO {table} VALUES ({placeholder})', data)

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

def update_new_data():
  with requests.Session() as s:
    d = datetime.strptime('2020-03-24', '%Y-%m-%d')
    while d.strftime('%Y-%m-%d') != datetime.today().strftime('%Y-%m-%d'):
      date = d.strftime('%Y-%m-%d')
      date_api = d.strftime('%m-%d-%Y')
      r = s.get(f'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/{date_api}.csv')
      if r.status_code >= 300:
        d += timedelta(days=1)
        continue
      cr = csv.reader(r.content.decode('utf-8').splitlines(), delimiter=',')
      c.execute(f'ALTER TABLE CONFIRMED ADD "{date}" INTEGER')
      c.execute(f'ALTER TABLE RECOVERED ADD "{date}" INTEGER')
      c.execute(f'ALTER TABLE DEATHS ADD "{date}" INTEGER')
      condic = {}
      deadic = {}
      recdic = {}
      for row in list(cr)[1:]:
        _, _, pro, cou, _, _lat, _long, con, dea, rec, *_ = row
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
            c.execute(f'UPDATE {table} SET "{date}"="{dupdate}" where country="{cou}" and province="{pro}"')
          except:
            dstr, dval = date_to_start(date, dupdate)
            c.execute(f'''INSERT INTO {table} (province, country, lat, long, {dstr})
              VALUES ("{pro}", "{cou}", "{_lat}", "{_long}", {dval})''')
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
    extend_col = None
    for table in ['CONFIRMED', 'RECOVERED', 'DEATHS']:
      r = s.get(f'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_{table.lower()}_global.csv')
      cr = csv.reader(r.content.decode('utf-8').splitlines(), delimiter=',')
      header = list(cr)[0]
      cursor = c.execute(f'select * from {table}')
      names = [description[0] for description in cursor.description]
      if format_date(header[-1]) != names[-1]:
          extend_col = header[-1]
          c.execute(f'ALTER TABLE {table} ADD "{format_date(extend_col)}" INTEGER')
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
  if extend_col != None:
    for table in ['CONFIRMED', 'RECOVERED', 'DEATHS']:
      c.execute(f'select * from {table}')
      for row in c.fetchall():
        pro, cou, _, _, *data = row
        if row[-1] is None:
          c.execute(f'UPDATE {table} SET "{format_date(extend_col)}"="{row[-2]}" where country="{cou}" and province="{pro}"')



def write_csv():
  for table in ['CONFIRMED', 'RECOVERED', 'DEATHS']:
    cursor = c.execute(f'select * from {table}')
    names = [description[0] for description in cursor.description]
    with open(f'scripts/data/{table.lower()}_timeseries.csv', 'w', newline='') as f:
      w = csv.writer(f, delimiter=',')
      w.writerow(names)
      for row in c.fetchall():
        w.writerow(row)


conn = sqlite3.connect('scripts/data/sqlite.db')
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

