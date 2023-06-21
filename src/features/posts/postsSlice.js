import { createSlice } from '@reduxjs/toolkit';

const initialState = [
  {
    id: '1', 
    title: 'First Post!',
    content: 'Hello!'
  },
  {
    id: '2',
    title: 'Second Post',
    content: 'More text'
  }
]

// don't try to mutate any data outside of createSlice!
// createSlice() converts mutations into safe immutable updates internally using the Immer library
const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    // when we write the postAdded reducer function, createSlice automagically 
    // generates an "action creator" function with the same name:
    postAdded(state, action) {
      state.push(action.payload)
    }
  }
})

// we then export the action creator and use it in our components to 
// dispatch the action when the user clicks "save post":
export const { postAdded } = postsSlice.actions

export default postsSlice.reducer;