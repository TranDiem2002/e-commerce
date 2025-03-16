import React, { useState } from 'react';
import './SuggestionList.scss';
import cn from 'classnames';
import { useAction } from '../../../hooks/useAction';
import { post } from '../../../services/request';
import { API_LIST } from '../../../contants/common';
import { useSelector } from 'react-redux';

const SuggestionList = ({ listItem = {} }) => {
  return (
    <div className='list-item'>
      {listItem?.map((item) => (
        <SuggestionItem
          key={item.userId}
          img={item.base64Image}
          username={item.userName}
          fullname={item.fullName}
        />
      ))}
    </div>
  );
};

const SuggestionItem = ({ id, img, username, fullname }) => {
  const [isFollowed, setIsFollowed] = useState('');
  const [isLoading, setIsLoading] = useState('');
  const { token } = useSelector((store) => store.user);
  const { action } = useAction();

  const handleFollow = async () => {
    setIsLoading(true);
    await action({
      action: async () =>
        await post({
          url: API_LIST.post_add_following,
          config: {
            headers: { authorization: 'Bearer ' + token },
            params: { userName: username },
          },
        }),
      onSuccess: async (data) => {
        setIsFollowed(true);
        setIsLoading(false);
      },
    });
  };

  return (
    <div className='item' key={id}>
      <div className='info-item'>
        <img src={`data:image/png;base64, ${img}`} alt='' />
        <div className='group-info'>
          <span className='username'>{username}</span>
          <h4>{fullname}</h4>
        </div>
      </div>
      <button
        onClick={() => handleFollow()}
        className={cn(
          { 'btn-follow': !isFollowed },
          { 'btn-followed': isFollowed },
        )}
      >
        {isLoading ? '...loading' : isFollowed ? 'Following' : 'Follow'}
      </button>
    </div>
  );
};

export default SuggestionList;
