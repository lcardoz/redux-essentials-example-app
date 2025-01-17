import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { PostAuthor } from './PostAuthor';
import { TimeAgo } from './TimeAgo';
import { ReactionButtons } from './ReactionButtons';
import { fetchPosts, selectPostIds, selectPostById } from './postsSlice';
import { Spinner } from '../../components/Spinner'

// changed const to let, added React.memo line 28 so that PostExcerpts only re-render if props change
// let PostExcerpt = ({ post }) => {
// postId is passed to each PostExcerpt component instead of post:
let PostExcerpt = ({ postId }) => {
  // read just the sorted array of post IDs, and pass postId to each <PostExcerpt>:
  const post = useSelector(state => selectPostById(state, postId))

  return (
    <article className="post-excerpt" key={post.id}>
      <h3>{post.title}</h3>
      <div>
        <PostAuthor userId={post.user} />
        <TimeAgo timestamp={post.date} />
      </div>
      <p className="post-content">{post.content.substring(0, 100)}</p>
      <ReactionButtons post={post} />
      <Link to={`posts/${post.id}`} className="button muted-button">
        View Post
      </Link>
    </article>
  )
}

PostExcerpt = React.memo(PostExcerpt)

export const PostsList = () => {
  const dispatch = useDispatch()
  const orderedPostIds = useSelector(selectPostIds)
  // const posts = useSelector(selectAllPosts)
  const postStatus = useSelector(state => state.posts.status)
  const error = useSelector(state => state.posts.error)

  useEffect(() => {
    if (postStatus === 'idle') {
      dispatch(fetchPosts())
    }
  }, [postStatus, dispatch])

  let content
  
  if (postStatus === 'loading') {
    content = <Spinner text='Loading...' />
  } else if (postStatus === 'succeeded') {
    content = orderedPostIds.map(postId => (
      <PostExcerpt key={postId} postId={postId} />
    ))
    // Sort posts in reverse chronological order by datetime string to get newest posts first:
    // const orderedPosts = posts
    //   .slice()
    //   .sort((a,b) => b.date.localeCompare(a.date))

    // content = orderedPosts.map(post => (
    //   <PostExcerpt key={post.id} post={post} />
    // ))
  } else if (postStatus === 'failed') {
    content = <div>{error}</div>
  }
  // Sort posts in reverse chronological order by datetime string to get newest posts first:
  // const orderedPosts = posts.slice().sort((a,b) => b.date.localeCompare(a.date))
  // const renderedPosts = orderedPosts.map(post => (
  //   <article className="post-excerpt" key={post.id}>
  //     <h3>{post.title}</h3>
  //     <div>
  //       <PostAuthor userId={post.user} />
  //       <TimeAgo timestamp={post.date} />
  //     </div>
  //     <p className="post-content">{post.content.substring(0, 100)}</p>
  //     <ReactionButtons post={post} />
  //     <Link to={`posts/${post.id}`} className="button muted-button">
  //       View Post
  //     </Link>
  //   </article>
  // ))

  return (
    <section className="posts-list">
      <h2>Posts</h2>
      {content}
      {/* {renderedPosts} */}
    </section>
  )
}
