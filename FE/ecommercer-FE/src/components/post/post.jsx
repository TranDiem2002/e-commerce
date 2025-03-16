import './post.scss';
import defaultUserImg from '../../assets/img/user.jpg';
import { useRef, useState } from 'react';
import Dot from '../common/dot/dot';
import classNames from 'classnames';
import HearthSvg from '../../assets/svg/hearthSvg';
import { useAction } from '../../hooks/useAction';
import { post } from '../../services/request';
import { API_LIST } from '../../contants/common';
import { useSelector } from 'react-redux';

const Post = ({ postInfo, onClick }) => {
  const {
    postID,
    username,
    content,
    countLike = 0,
    countComments = 0,
    base64video = '',
    createBy,
    base64Image = '',
  } = postInfo;
  const [commentValue, setCommentValue] = useState('');
  const [isLiked, setIsLiked] = useState('');
  const { action } = useAction();
  const { token } = useSelector((store) => store.user);
  const commentRef = useRef(null);

  console.log(base64Image?.[0]);

  const handleComment = (e) => {
    if (!e) return;
    setCommentValue(e.target.innerText);
  };

  const handleOnclick = () => {
    onClick && onClick(postID);
  };

  const handlePostComment = async () => {
    await action({
      action: async () =>
        await post({
          url: `${API_LIST.post_add_comment}/${postID}/addComments`,
          data: {
            comment: commentValue,
          },
          config: {
            headers: { authorization: 'Bearer ' + token },
          },
        }),
      onSuccess: async (data) => {
        setCommentValue('');
        commentRef.current.innerHTML = '';
      },
    });
  };

  return (
    <div className='post'>
      <div className='post__user-info__wrapper'>
        <div className='post__user-info'>
          <div className='post__user-img__wrapper'>
            <div className='post__user-img'>
              <img src={`data:image;base64, ${createBy.base64Image}`} alt='' />
            </div>
          </div>
          <span className='post__username'>{createBy.userName}</span>
          <Dot />
          <span className='post__follow'>Follow</span>
        </div>
      </div>
      {base64Image?.[0] && (
        <div className='post__img-video' onClick={() => handleOnclick()}>
          <img src={`data:image;base64, ${base64Image?.[0]}`} alt='' />
        </div>
      )}
      {!base64Image?.[0] && base64video?.[0] && (
        <div className='post__img-video'>
          <video controls>
            <source
              src={`data:video;base64, ${base64video[0]}`}
              type='video/mp4'
            ></source>
          </video>
        </div>
      )}
      <div
        className={classNames('post__action', {
          'post__action-liked': isLiked,
        })}
      >
        <HearthSvg />
      </div>
      {countLike ? (
        <div className='post__like'>
          <span>{countLike} likes</span>
        </div>
      ) : (
        ''
      )}
      {content ? (
        <div className='post__caption'>
          <span className='post__caption-username'>{username}&nbsp;</span>
          <p className='post__caption-text'>{content}</p>
        </div>
      ) : (
        ''
      )}
      {countComments ? (
        <div className='post__view-comment'>
          <span
            className='post__view-comment-text'
            onClick={() => handleOnclick()}
          >
            View {countComments > 1 ? `all ${countComments}` : 1} comments
          </span>
        </div>
      ) : (
        ''
      )}
      <div className='post__comment'>
        <span
          onInput={handleComment}
          className={classNames('post__comment-input', {
            'post__comment-input__has-value': commentValue,
          })}
          ref={commentRef}
          contentEditable
        ></span>
        {commentValue && (
          <span
            className='post__comment-submit'
            onClick={() => handlePostComment()}
          >
            Post
          </span>
        )}
      </div>
    </div>
  );
};

export default Post;
