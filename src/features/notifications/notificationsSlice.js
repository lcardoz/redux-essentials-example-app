import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import { client } from '../../api/client';

const notificationsAdapter = createEntityAdapter({
  sortComparer: (a, b) => b.date.localeCompare(a.date),
})

// We've written an async thunk called fetchNotifications, which will retrieve a list of new notifications from the server. 
// As part of that, we want to use the creation timestamp of the most recent notification as part of our request, 
// so that the server knows it should only send back notifications that are actually new.
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { getState }) => {
    const allNotifications = selectAllNotifications(getState())
    const [latestNotification] = allNotifications
    const latestTimestamp = latestNotification ? latestNotification.date : ''
    const response = await client.get(
      `/fakeApi/notifications?since=${latestTimestamp}`
    )
    return response.data
  }
)

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: notificationsAdapter.getInitialState(),
  // initialState: [],
  reducers: {
    allNotificationsRead(state, action) {
      // we do have a couple places in here where we need to loop over all notification objects and update them. Since those are no longer being kept in an array, we have to use Object.values(state.entities) to get an array of those notifications and loop over that.
      Object.values(state.entities).forEach(notification => {
        notification.read = true
      })
      // state.forEach(notification => {
      //   notification.read = true
      // })
    }
  },
  extraReducers(builder) {
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      notificationsAdapter.upsertMany(state, action.payload)
      // we do have a couple places in here where we need to loop over all notification objects and update them. Since those are no longer being kept in an array, we have to use Object.values(state.entities) to get an array of those notifications and loop over that.
      Object.values(state.entities).forEach(notification => {
        // Any notifications we've read are no longer new:
        notification.isNew = !notification.read
      })
      // state.push(...action.payload)
      // state.forEach(notification => {
      //   // Any notifications we've read are no longer new:
      //   notification.isNew = !notification.read
      // })
      // // Sort with newest first:
      // state.sort((a, b) => b.date.localeCompare(a.date))
    })
  }
})

export const { allNotificationsRead } = notificationsSlice.actions

export default notificationsSlice.reducer

export const { selectAll: selectAllNotifications } = 
notificationsAdapter.getSelectors(state => state.notifications)
// export const selectAllNotifications = state => state.notifications
