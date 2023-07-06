import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import { client } from '../../api/client';

// now we're getting users from our API
// const initialState = [
//   {
//     id: '0',
//     name: 'Tianna Jenkins'
//   },
//   {
//     id: '1',
//     name: 'Kevin Grant'
//   },
//   {
//     id: '2',
//     name: 'Madison Price'
//   }
// ]

const usersAdapter = createEntityAdapter()

const initialState = usersAdapter.getInitialState()
// const initialState = []

export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
  const response = await client.get('/fakeApi/users')
  return response.data
})

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers(builder) {
    // The only action we're handling here always replaces the entire list of users with the array we fetched from the server. We can use usersAdapter.setAll to implement that instead:
    builder.addCase(fetchUsers.fulfilled, usersAdapter.setAll)
    // builder.addCase(fetchUsers.fulfilled, (state, action) => {
    //   // Immer lets us update state in two ways: either mutating the existing state value, or returning a new result.
    //   //  If we return a new value, that will replace the existing state completely with whatever we return.
    //   return action.payload
    // })
  }
})

export default usersSlice.reducer

export const { selectAll: selectAllUsers, selectById: selectUserById } = 
  usersAdapter.getSelectors(state => state.users)
// export const selectAllUsers = state => state.users
// export const selectUserById = (state, userId) => state.users.find(user => user.id === userId)
