import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import math
from keras.preprocessing.sequence import TimeseriesGenerator
from keras.models import Sequential
from keras.layers import Dense
from keras.layers import LSTM
from keras.layers import Dropout
from keras.utils import plot_model
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error
from pandas.tseries.offsets import DateOffset
from tqdm import tqdm

# Read csv, only use data start from Feb, every row is a independent training set


def train_lstm(data, num_day_pred):
  df = data.drop(['country', 'province', 'lat', 'long'], axis=1).fillna(axis=1, method='ffill')
  for i in range(22, 32):
    df = df.drop('2020-01-{}'.format(i), axis=1)
  num_day_pred = 7
  model = Sequential()
  model.add(LSTM(200, activation='relu', input_shape=(num_day_pred, 1)))
  model.add(Dropout(0.25))
  model.add(Dense(1))
  model.compile(loss='mse', optimizer='adam')
  model.summary()
  plot_model(model, to_file='model.png')

  # date = df.columns.values.reshape(-1,1)
  # for i in tqdm(range(len(df))):
  #     arr = df.iloc[i].values
  #     cur_df = pd.DataFrame(np.concatenate((date, arr.reshape(-1,1)), axis=1), columns=['date', 'val'])
  #     cur_df.date = pd.to_datetime(cur_df.date)
  #     cur_df = cur_df.set_index('date')

  #     scaler = MinMaxScaler()
  #     train = scaler.fit_transform(cur_df)
  #     generator = TimeseriesGenerator(train, train, length=num_day_pred, batch_size=2)

  #     model.fit_generator(generator, epochs=2, verbose=0)

  # df_worldwide = pd.DataFrame(np.concatenate((date, df.sum(axis=0).values.reshape(-1,1)), axis=1), columns=['date', 'val'])
  # df_worldwide.date = pd.to_datetime(df_worldwide.date)
  # df_worldwide = df_worldwide.set_index('date').astype('int')
  # scaler = MinMaxScaler()
  # train = scaler.fit_transform(df_worldwide)
  # generator = TimeseriesGenerator(train, train, length=num_day_pred, batch_size=2)

  # model.fit_generator(generator, epochs=120)


  # preds = []
  # batch = train[-num_day_pred:].reshape((1, num_day_pred, 1))
  # for i in range(num_day_pred):
  #     preds.append(model.predict(batch)[0])
  #     batch = np.append(batch[:, 1:, :],[[preds[i]]], axis=1)

  # add_dates = [df_worldwide.index[-1] + DateOffset(days=x) for x in range(num_day_pred+1)]
  # future = pd.DataFrame(index=add_dates, columns=['val'])

  # df_pred = pd.DataFrame(scaler.inverse_transform(preds), index=future[-num_day_pred:].index, columns=['val'])
  # df_pred.val = pd.to_numeric(df_pred.val).astype('int')
  # df_final = pd.concat((df_worldwide, df_pred), axis=1)
  # return df_final

confirmed = pd.read_csv('./scripts/data/confirmed_timeseries.csv')
recovered = pd.read_csv('./scripts/data/recovered_timeseries.csv')
deaths = pd.read_csv('./scripts/data/deaths_timeseries.csv')

print('processing confirmed data')
train_lstm(confirmed, 7).to_csv('./scripts/pred/pred_confirmed.csv', sep=',')
print('processing recovered data')
train_lstm(recovered, 7).to_csv('./scripts/pred/pred_recovered.csv', sep=',')
print('processing deaths data')
train_lstm(deaths, 7).to_csv('./scripts/pred/pred_deaths.csv', sep=',')
