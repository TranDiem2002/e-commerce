import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Button from '../../components/common/button/button';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import './register.scss';
import { useDispatch } from 'react-redux';
import { setToken } from '../../slice/userSlice';
import { useRouter } from '../../hooks/useRouter';
import { API_LIST } from '../../contants/common';
import { post } from '../../services/request';
import { useAction } from '../../hooks/useAction';

const schema = yup.object({
  email: yup.string().required('Email is required!').email('Invalid email!'),
  password: yup.string().required('Password is required!'),
  username: yup.string().required('User Name is required!'),
  fullname: yup.string().required('Full Name is required!'),
});

const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });
  const dispatch = useDispatch();
  const { pushRoute } = useRouter();
  const { action } = useAction();
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    dispatch(setToken(token));
    if (token) {
      pushRoute('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmitForm = async (data) => {
    await action({
      action: async () =>
        await post({
          url: API_LIST.register,
          data: {
            fullName: data.fullname,
            userName: data.username,
            email: data.email,
            passWord: data.password,
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

  return (
    <div className='register-container'>
      <form className='register-form' onSubmit={handleSubmit(onSubmitForm)}>
        <h2 className='register-title'>𝓝𝓮𝓽𝓝𝓮𝓼𝓽</h2>
        <input
          className='register-fullname'
          type='text'
          name='fullname'
          placeholder='Fullname'
          {...register('fullname')}
        />
        <p className='register-errText'>{errors.fullname?.message}</p>
        <input
          className='register-username'
          type='text'
          name='username'
          placeholder='Username'
          {...register('username')}
        />
        <p className='register-errText'>{errors.username?.message}</p>
        <input
          className='register-email'
          type='text'
          name='email'
          placeholder='Email'
          {...register('email')}
        />
        <p className='register-errText'>{errors.email?.message}</p>
        <input
          className='register-password'
          rows='10'
          type='password'
          name='password'
          placeholder='Password'
          {...register('password')}
        />
        <p className='register-errText'>{errors.password?.message}</p>
        <p className='register-errText'>{errorText}</p>
        <Button btnType='submit' text='Register' className='register-button' />
        <a href='/login' className='register-dontHave'>
          Already have an account
        </a>
      </form>
    </div>
  );
};

export default RegisterPage;
