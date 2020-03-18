const initialState = {
  darkMode: false,
  timseriesData: {},
  lastUpdateData: {},
}

export default (state = initialState, action) => {
  switch (action.type) {
    case 'TOGGLE_MODE':
      return {
        ...state,
        darkMode: !state.darkMode
      }
    case 'UPDATE_TIMESERIES_DATA':
      return {
        ...state,
        timseriesData: action.timseriesData
      }
    case 'UPDATE_LASTUPDATE_DATA':
      return {
        ...state,
        lastUpdateData: action.lastUpdateData
      }
    default:
      return state
  }
}
