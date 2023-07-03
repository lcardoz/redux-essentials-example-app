import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
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

const initialState = []

export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
  const response = await client.get('/fakeApi/users')
  return response.data
})

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(fetchUsers.fulfilled, (state, action) => {
      // Immer lets us update state in two ways: either mutating the existing state value, or returning a new result.
      //  If we return a new value, that will replace the existing state completely with whatever we return.
      return action.payload
    })
  }
})

export default usersSlice.reducer