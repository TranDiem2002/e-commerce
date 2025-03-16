import classNames from 'classnames';
import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import CloseSvg from '../../assets/svg/closeSvg';
import HearthSvg from '../../assets/svg/hearthSvg';
import { API_LIST } from '../../contants/common';
import { useAction } from '../../hooks/useAction';
import { post } from '../../services/request';
import Dot from '../common/dot/dot';
import './viewPost.scss';

const ViewPost = ({ viewPostInfo, postComment, onClose }) => {
  const {
    comments = [],
    countLike = 0,
    base64Image,
    base64Video,
  } = viewPostInfo || {};
  const commentRef = useRef();
  const [commentValue, setCommentValue] = useState('');
  const [followSuccess, setFollowSuccess] = useState('');
  const [isLoading, setIsLoading] = useState('');
  const { action } = useAction();
  const { token } = useSelector((store) => store.user);
  // useEffect(() => {
  //   window.addEventListener('click', (e) => {
  //     e.stopPropagation();
  //     onClose();
  //   });
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  const handleFollow = async () => {
    setIsLoading(true);
    await action({
      action: async () =>
        await post({
          url: API_LIST.post_add_following,
          config: {
            headers: { authorization: 'Bearer ' + token },
            params: { userName: viewPostInfo.createBy.userName },
          },
        }),
      onSuccess: async (data) => {
        setFollowSuccess(true);
        setIsLoading(false);
      },
    });
  };

  const handlePostComment = async () => {
    await action({
      action: async () =>
        await post({
          url: `${API_LIST.post_add_comment}/${viewPostInfo.postID}/addComments`,
          data: {
            comment: commentValue,
          },
          config: {
            headers: { authorization: 'Bearer ' + token },
          },
        }),
      onSuccess: async (data) => {
        await postComment(data.postID);
        setCommentValue('');
        commentRef.current.innerHTML = '';
      },
    });
  };

  const handleClose = () => {
    onClose();
  };

  const handleComment = (e) => {
    if (!e) return;
    setCommentValue(e.target.innerText);
  };

  return (
    <>
      {viewPostInfo && (
        <div className='view-post__container' onClick={() => handleClose()}>
          <div className='view-post__close' onClick={() => handleClose()}>
            <CloseSvg />
          </div>
          <div className='view-post' onClick={(e) => e.stopPropagation()}>
            {base64Image && (
              <div className='view-post__img'>
                <img src={`data:image;base64, ${base64Image}`} alt='' />
              </div>
            )}
            {!base64Image && base64Video && (
              <div className='view-post__img'>
                <video controls>
                  <source src={`data:video;base64, ${base64Video}`} />
                </video>
              </div>
            )}
            <div className='view-post__comment-section'>
              <div className='view-post__user-info view-post__author-info'>
                <div className='view-post__user-img view-post__comment-section__user-img'>
                  <img src={`data:image;base64, ${base64Image}`} alt='' />
                </div>
                <div className='view-post__comment-section__user-name'>
                  {viewPostInfo.createBy?.userName}
                </div>
                {!followSuccess && (
                  <>
                    <Dot />
                    <div
                      className='view-post__comment-section__follow-btn'
                      onClick={() => handleFollow()}
                    >
                      {isLoading ? '...loading' : 'Follow'}
                    </div>
                  </>
                )}
              </div>
              <div className='view-post__comment-section__comment__wrapper'>
                <ul className='view-post__comment-section__comments'>
                  {comments.length > 0 &&
                    comments.map((commentsItem, key) => {
                      return (
                        <li
                          key={key}
                          className='view-post__user-info view-post__comment-section__comment'
                        >
                          <div className='view-post__comment-section__comment__user-img__wrapper'>
                            <div className='view-post__user-img view-post__comment-section__comment__user-img'>
                              <img
                                src={`data:image;base64, ${commentsItem.user.base64Image}`}
                                alt=''
                              />
                            </div>
                          </div>
                          <div className='view-post__comment-section__user-info'>
                            <p className='view-post__user-comment view-post__comment-section__comment__text'>
                              <span className='view-post__user-name'>
                                {commentsItem.user.userName}&nbsp;
                              </span>
                              {commentsItem.comment}
                            </p>
                            {/* {commentsItem.user.countLike && ( */}
                            <div className='view-post__action'>
                              <span>
                                {commentsItem.user.countLike || 0} likes
                              </span>
                            </div>
                            {/* )} */}
                          </div>
                          <div className='view-post__reaction'>
                            <div className='view-post__reaction__like'>
                              <HearthSvg />
                            </div>
                          </div>
                        </li>
                      );
                    })}
                </ul>
              </div>
              <div className='view-post__reaction-timestamp'>
                <div className='view-post__reaction'>
                  <div className='view-post__reaction__like'>
                    <HearthSvg />
                  </div>
                </div>
                <div className='view-post__like'> {countLike || 0} likes </div>
                {/* <div className='view-post__timestamp'>
                </div> */}
              </div>
              <div className='view-post__comment'>
                <span
                  onInput={handleComment}
                  className={classNames('view-post__comment-input', {
                    'view-post__comment-input__has-value': commentValue,
                  })}
                  ref={commentRef}
                  contentEditable
                ></span>
                <span
                  className={classNames('view-post__comment-submit', {
                    'view-post__comment-submit__has-value': commentValue,
                  })}
                  onClick={() => handlePostComment()}
                >
                  Post
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewPost;
