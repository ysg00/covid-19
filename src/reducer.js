const initialState = {
  darkMode: false,
  isLoading: true,
  timeSeriesData: {},
  lastUpdateData: {},
  geoJson: {},
};

export default (state = initialState, action) => {
  switch (action.type) {
    case 'DONE_LOADING':
      return {
        ...state,
        isLoading: false,
      };
    case 'TOGGLE_DARK_MODE':
      return {
        ...state,
        darkMode: !state.darkMode,
      };
    case 'UPDATE_TIMESERIES_DATA':
      return {
        ...state,
        timeSeriesData: action.timeSeriesData,
      };
    case 'UPDATE_LASTUPDATE_DATA':
      return {
        ...state,
        lastUpdateData: action.lastUpdateData,
      };
    case 'UPDATE_GEOJSON':
      return {
        ...state,
        geoJson: action.geoJson,
      };
    default:
      return state;
  };
};
