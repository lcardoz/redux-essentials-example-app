import { createSlice, nanoid, createAsyncThunk } from '@reduxjs/toolkit';
// import { sub } from 'date-fns';
import { client } from '../../api/client';

// using API to fetch initial state data now: We'll switch our state from being an array of posts by itself, to look like {posts, status, error}. We'll also remove the old sample post entries from our initial state. 
// prev hardcoded initial state:
// const initialState = [
//   {
//     id: '1', 
//     title: 'First Post!',
//     content: 'Hello!',
//     user: '0',
//     date: sub(new Date(), { minutes: 10 }).toISOString(),
//     reactions: {thumbsUp: 0, hooray: 0, heart: 0, rocket: 0, eyes: 0}
//   },
//   {
//     id: '2',
//     title: 'Second Post',
//     content: 'More text',
//     user: '2',
//     date: sub(new Date(), { minutes: 5 }).toISOString(),
//     reactions: {thumbsUp: 0, hooray: 0, heart: 0, rocket: 0, eyes: 0}
//   },
// ]

const initialState = {
  posts: [],
  status: 'idle',
  error: null
}

// don't try to mutate any data outside of createSlice!
// createSlice() converts mutations into safe immutable updates internally using the Immer library
const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    // No longer need the existing `postAdded` reducer and prepare callback:
    // postAdded: {
    //   reducer (state, action) {
    //     state.posts.push(action.payload)
    //   },
    //   prepare(title, content, userId) {
    //     return {
    //       payload: {
    //         id: nanoid(),
    //         date: new Date().toISOString(),
    //         title,
    //         content,
    //         user: userId,
    //         reactions: {thumbsUp: 0, hooray: 0, heart: 0, rocket: 0, eyes: 0},
    //       },
    //     }
    //   }
    // },
    reactionAdded(state, action) {
      const { postId, reaction } = action.payload
      const existingPost = state.posts.find(post => post.id === postId)
      if (existingPost) {
        existingPost.reactions[reaction]++
      }
    },
    postUpdated(state, action) {
      const { id, title, content } = action.payload
      const existingPost = state.posts.find(post => post.id === id)
      if (existingPost) {
        existingPost.title = title
        existingPost.content = content
      }
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchPosts.pending, (state, action) => {
        state.status = 'loading'
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.posts = state.posts.concat(action.payload)
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      .addCase(addNewPost.fulfilled, (state, action) => {
        // We can directly add the new post object to our posts array:
        state.posts.push(action.payload)
      })
  }
})

// we then export the action creator and use it in our components to 
// dispatch the action when the user clicks "save post" or "edit post":
export const { postAdded, postUpdated, reactionAdded } = postsSlice.actions

export default postsSlice.reducer;

// like any abstraction, it's not something you should do all the time, everywhere. 
// Writing selectors means more code to understand and maintain. 
// Don't feel like you need to write selectors for every single field of your state. 
// Try starting without any selectors, and add some later when you find yourself 
// looking up the same values in many parts of your application code.
export const selectAllPosts = state => state.posts.posts

export const selectPostById = (state, postId) => state.posts.posts.find(post => post.id === postId)

export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
  const response = await client.get('/fakeApi/posts')
  // response object looks like { data:[] }
  return response.data
  // response.data returns just the array of posts
})

export const addNewPost = createAsyncThunk(
  'posts/addNewPost',
  // The payload creator receives the partial `{title, content, user}` object
  async initialPost => {
    // We send the initial data to the fake API server
    const response = await client.post('/fakeApi/posts', initialPost)
    // The response includes the complete post object, including unique ID that's generated
    return response.data
  }
)