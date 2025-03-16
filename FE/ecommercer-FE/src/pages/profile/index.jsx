import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Info from '../../components/profile/info';
import { API_LIST } from '../../contants/common';
import { useAction } from '../../hooks/useAction';
import { get } from '../../services/request';
import './style.scss';
import EditModal from '../../components/edit/editModal';

const ProfilePage = () => {
  const [userInfo, setUserInfo] = useState({});
  const { token } = useSelector((store) => store.user);
  const { action } = useAction();

  useEffect(() => {
    if (!token) return;
    getUserDetail();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const getUserDetail = async () => {
    await action({
      action: async () =>
        await get({
          url: API_LIST.get_user_detail,
          config: {
            headers: { authorization: 'Bearer ' + token },
          },
        }),
      onSuccess: async (data) => {
        setUserInfo(data);
      },
    });
  };

  return (
    <>
      <Info userInfo={userInfo} />
      {/* <EditModal /> */}
    </>
  );
};

export default ProfilePage;
