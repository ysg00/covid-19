const initialState = {
  darkMode: false,
  isLoading: true,
  timeSeries: {},
  latestUpdate: {},
  featureIdx: {},
  features: {},
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
    case 'UPDATE_TIMESERIES':
      return {
        ...state,
        timeSeries: action.timeSeries,
      };
    case 'UPDATE_LATESTUPDATE':
      return {
        ...state,
        latestUpdate: action.latestUpdate,
      };
    case 'UPDATE_FEATURES':
      return {
        ...state,
        features: action.features,
      };
    case 'UPDATE_FEATUREIDX':
      return {
        ...state,
        featureIdx: action.featureIdx,
      };
    default:
      return state;
  };
};
