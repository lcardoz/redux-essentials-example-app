import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { PostAuthor } from './PostAuthor';

export const SinglePostPage = ({ match }) => {

  const { postId } = match.params;

  // component will re-render any time the value returned 
  // from useSelector changes to a new reference.
  const post = useSelector(state => 
    state.posts.find(post => post.id === postId)
  )

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
          <PostAuthor userId={post.user}/>
        </div>
        <p className="post-section">{post.content}</p>
        <Link to={`/editPost/${post.id}`} className="button">
          Edit Post
        </Link>
      </article>
    </section>
  )
}
