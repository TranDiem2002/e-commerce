import React, { useEffect, useState } from 'react';
import { FOLLOWED_LIST, POST_LIST, SUGGESTION_LIST } from '../../contants/mock';
import SuggestionList from '../../components/suggestion/suggestionList/SuggestionList';
import './home.scss';
import FollowedList from '../../components/followed/followed';
import PostList from '../../components/postList/postList';
import { useAction } from '../../hooks/useAction';
import { API_LIST } from '../../contants/common';
import { get } from '../../services/request';
import { useDispatch, useSelector } from 'react-redux';
import userSlice, { setUserDetail } from '../../slice/userSlice';

const HomePage = () => {
  const { action, actionAll } = useAction();
  const [postData, setPostData] = useState([]);
  const [followerData, setFollowerData] = useState([]);
  const [followingData, setFollowingData] = useState([]);
  const [suggestFriend, setSuggestFriend] = useState([]);
  const { token } = useSelector((store) => store.user);

  useEffect(() => {
    if (!token) return;
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const getData = async () => {
    await actionAll([
      getPost(),
      getFollower(),
      getFollowing(),
      getSuggestFriend(),
    ]);
  };

  const getPost = async () => {
    await action({
      action: async () =>
        await get({
          url: API_LIST.home,
          config: { headers: { authorization: 'Bearer ' + token } },
        }),
      onSuccess: async (data) => {
        setPostData(data);
      },
    });
  };

  const getSuggestFriend = async () => {
    await action({
      action: async () =>
        await get({
          url: API_LIST.suggest_friend,
          config: { headers: { authorization: 'Bearer ' + token } },
        }),
      onSuccess: async (data) => {
        setSuggestFriend(data);
      },
    });
  };

  const getFollower = async () => {
    await action({
      action: async () =>
        await get({
          url: API_LIST.get_followers,
          config: { headers: { authorization: 'Bearer ' + token } },
        }),
      onSuccess: async (data) => {
        setFollowerData(data);
      },
    });
  };

  const getFollowing = async () => {
    await action({
      action: async () =>
        await get({
          url: API_LIST.get_following,
          config: { headers: { authorization: 'Bearer ' + token } },
        }),
      onSuccess: async (data) => {
        setFollowingData(data);
      },
    });
  };

  if (!followingData) {
    return (
      <div className='homePage-suggestion'>
        <div className='homePage-suggestion-content'>
          <span>Suggested for you</span>
          <SuggestionList listItem={suggestFriend} />
        </div>
      </div>
    );
  } else {
    return (
      <div className='homePage-suggestion'>
        <div className='homePage-suggestion-content'>
          <FollowedList listUser={followingData || []} />
          <PostList postList={postData || []} />
        </div>
      </div>
    );
  }
};

export default HomePage;
