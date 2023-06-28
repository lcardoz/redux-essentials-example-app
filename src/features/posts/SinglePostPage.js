import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { PostAuthor } from './PostAuthor';
import { TimeAgo } from './TimeAgo';
import { ReactionButtons } from './ReactionButtons';
import { selectPostById } from './postsSlice';

export const SinglePostPage = ({ match }) => {

  const { postId } = match.params;

  // component will re-render any time the value returned 
  // from useSelector changes to a new reference.
  const post = useSelector(state => selectPostById(state, postId))

  // if no post/postId, find() function will return undefined
  // instead of an actual post object, error handling:
  if (!post) {
    return (
      <section>
        <h2>Post not found!</h2>
      </section>
    )
  }

  return (
    <section>
      <article className="post">
        <h2>{post.title}</h2>
        <div>
          <PostAuthor userId={post.user} />
          <TimeAgo timestamp={post.date} />
        </div>
        <p className="post-section">{post.content}</p>
        <ReactionButtons post={post} />
        <Link to={`/editPost/${post.id}`} className="button">
          Edit Post
        </Link>
      </article>
    </section>
  )
}
