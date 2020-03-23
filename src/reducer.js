export default (state = {
  darkMode: false,
  locale: 'en',
  isLoading: true,
  timeSeries: {},
  latestUpdate: {},
  featureIdx: {},
  features: {},
}, action) => {
  switch (action.type) {
    case 'SET_LOCALE':
      return {
        ...state,
        locale: action.locale,
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
    case 'DONE_LOADING':
      return {
        ...state,
        isLoading: false,
      };
    default:
      return state;
  };
};
