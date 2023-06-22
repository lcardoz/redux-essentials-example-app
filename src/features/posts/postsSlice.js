import { createSlice, nanoid } from '@reduxjs/toolkit';

const initialState = [
  {
    id: '1', 
    title: 'First Post!',
    content: 'Hello!',
    user: '0'
  },
  {
    id: '2',
    title: 'Second Post',
    content: 'More text',
    user: '2'
  },
]

// don't try to mutate any data outside of createSlice!
// createSlice() converts mutations into safe immutable updates internally using the Immer library
const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    postAdded: {
      reducer (state, action) {
        state.push(action.payload)
      },
      prepare(title, content, userId) {
        return {
          payload: {
            id: nanoid(),
            title,
            content,
            user: userId,
          }
        }
      }
    },
    postUpdated(state, action) {
      const { id, title, content } = action.payload
      const existingPost = state.find(post => post.id === id)
      if (existingPost) {
        existingPost.title = title
        existingPost.content = content
      }
    },
  }
})

// we then export the action creator and use it in our components to 
// dispatch the action when the user clicks "save post" or "edit post":
export const { postAdded, postUpdated } = postsSlice.actions

export default postsSlice.reducer;