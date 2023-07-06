import { createSlice, createAsyncThunk, createSelector, createEntityAdapter } from '@reduxjs/toolkit';
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

// creates an array of all post IDs sorted with the newest post first:
const postsAdapter = createEntityAdapter({
  sortComparer: (a, b) => b.date.localeCompare(a.date)
})

// const initialState = {
//   posts: [],
//   status: 'idle',
//   error: null
// }

// getInitialState() returns an empty {ids: [], entities: {}} normalized state object.
// Our postsSlice needs to keep the status and error fields for loading state too, so we pass those in to getInitialState()
const initialState = postsAdapter.getInitialState({
  status: 'idle',
  error: null
})

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
      // const existingPost = state.posts.find(post => post.id === postId)
      // Now that our posts are being kept as a lookup table in state.entities, we can change our reactionAdded and postUpdated reducers to directly look up the right posts by their IDs, instead of having to loop over the old posts array.
      const existingPost = state.entities[postId]
      if (existingPost) {
        existingPost.reactions[reaction]++
      }
    },
    postUpdated(state, action) {
      const { id, title, content } = action.payload
      // const existingPost = state.posts.find(post => post.id === id)
      // Now that our posts are being kept as a lookup table in state.entities, we can change our reactionAdded and postUpdated reducers to directly look up the right posts by their IDs, instead of having to loop over the old posts array.
      const existingPost = state.entities[id]
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
        // Add any fetched posts to the array
        // Use the `upsertMany` reducer as a mutating updating utility, and add all of the incoming posts to the state, by passing in the draft state and the array of posts in action.payload
        postsAdapter.upsertMany(state, action.payload)
        // state.posts = state.posts.concat(action.payload)
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      // Use the `addOne` reducer for the fulfilled case, and add that one new post object to our state. We can use the adapter functions as reducers directly, so we'll pass postsAdapter.addOne as the reducer function to handle that action.
      .addCase(addNewPost.fulfilled, postsAdapter.addOne)
      // .addCase(addNewPost.fulfilled, (state, action) => {
      //   // We can directly add the new post object to our posts array:
      //   state.posts.push(action.payload)
      // })
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

// replaced the old hand-written selectAllPosts and selectPostById selector functions with the ones generated by postsAdapter.getSelectors. 
// export const selectAllPosts = state => state.posts.posts
// export const selectPostById = (state, postId) => state.posts.posts.find(post => post.id === postId)

// Export the customized selectors for this adapter using `getSelectors`:
export const {
  // The generated selector functions are always called selectAll and selectById, so we can use ES6 destructuring syntax to rename them as we export them and match the old selector names:
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectIds: selectPostIds
  // Since the selectors are called with the root Redux state object, they need to know where to find our posts data in the Redux state, so we pass in a small selector that returns state.posts :
} = postsAdapter.getSelectors(state => state.posts)

export const selectPostsByUser = createSelector(
  [selectAllPosts, (state, userId) => userId],
  (posts, userId) => posts.filter(post => post.user === userId)
)

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