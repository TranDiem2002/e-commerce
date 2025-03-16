import { yupResolver } from '@hookform/resolvers/yup';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';
import Button from '../../components/common/button/button';
import { API_LIST } from '../../contants/common';
import { useAction } from '../../hooks/useAction';
import { useRouter } from '../../hooks/useRouter';
import { put } from '../../services/request';
import ModalWrapper from '../common/modalWrapper/modalWrapper';
import './editModal.scss';

const schema = yup.object({
  email: yup.string().required('Email is required!').email('Invalid email!'),
  // password: yup.string().required('Password is required!'),
  username: yup.string().required('User Name is required!'),
  fullname: yup.string().required('Full Name is required!'),
});

const EditModal = ({ onClose }) => {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.user);
  const { pushRoute } = useRouter();
  const { action } = useAction();
  const { token } = useSelector((store) => store.user);
  const [errorText, setErrorText] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [usernameValue, setUsernameValue] = useState('');
  const [fullnameValue, setFullnameValue] = useState('');

  useEffect(() => {
    if (user) {
      setValue('email', user.email);
      setValue('username', user.userName);
      setValue('fullname', user.fullName);

      setEmailValue(getValues('email'));
      setUsernameValue(getValues('username'));
      setFullnameValue(getValues('fullname'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const onSubmitForm = async (data) => {
    await action({
      action: async () =>
        await put({
          url: API_LIST.put_update_user,
          data: {
            fullName: data.fullname,
            userName: data.username,
            email: data.email,
          },
          config: {
            headers: { authorization: 'Bearer ' + token },
          },
        }),
      onSuccess: async (data) => {
        if (data === 'đã add user thành công') {
          pushRoute('/login');
        } else if (data === 'email đã tồn tại') {
          setErrorText('Email exited');
        } else if (data === 'user_name đã tồn tại') {
          setErrorText('Username exited');
        } else if (data === 'full_name đã tồn tại') {
          setErrorText('Fullname exited');
        }
      },
      onError: async () => {
        setErrorText('Something gone wrong');
      },
    });
  };

  const handleCheckUpdate = () => {};

  return (
    <ModalWrapper>
      <div className='edit-modal-container'>
        <form className='edit-modal-form' onSubmit={handleSubmit(onSubmitForm)}>
          <h2 className='edit-modal-title'>Update your profile</h2>
          <p className='edit-modal__input-title'>Fullname:</p>
          <input
            className='edit-modal-fullname'
            type='text'
            name='fullname'
            placeholder='Fullname'
            {...register('fullname')}
          />
          <p className='edit-modal-errText'>{errors.fullname?.message}</p>
          <p className='edit-modal__input-title'>Username:</p>
          <input
            className='edit-modal-username'
            type='text'
            name='username'
            placeholder='Username'
            {...register('username')}
          />
          <p className='edit-modal-errText'>{errors.username?.message}</p>
          <p className='edit-modal__input-title'>Email:</p>
          <input
            className='edit-modal-email'
            type='text'
            name='email'
            placeholder='Email'
            {...register('email')}
          />
          <p className='edit-modal-errText'>{errors.email?.message}</p>
          {/* <p className='edit-modal__input-title'>Password:</p>
          <input
            className='edit-modal-password'
            rows='10'
            type='password'
            name='password'
            placeholder='Password'
            {...register('password')}
          />
          <p className='edit-modal-errText'>{errors.password?.message}</p> */}
          <p className='edit-modal-errText'>{errorText}</p>
          <Button
            btnType='submit'
            text='Update'
            className='edit-modal-button'
          />
        </form>
      </div>
    </ModalWrapper>
  );
};

export default EditModal;
