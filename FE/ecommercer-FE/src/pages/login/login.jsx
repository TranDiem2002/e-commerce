import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Button from '../../components/common/button/button';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import './login.scss';
import { useDispatch } from 'react-redux';
import { setToken } from '../../slice/userSlice';
import { useRouter } from '../../hooks/useRouter';
import { post } from '../../services/request';
import { useAction } from '../../hooks/useAction';
import { API_LIST } from '../../contants/common';
import CloseSvg from '../../assets/svg/closeSvg';

const schema = yup.object({
  email: yup.string().required('Email is required!').email('Invalid email!'),
  password: yup.string().required('Password is required!'),
});

const LoginPage = () => {
  const { action } = useAction();
  const [errorText, setErrorText] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });
  const [autToken, setAutToken] = useState(localStorage.getItem('token') || '');
  const dispatch = useDispatch();
  const { pushRoute } = useRouter();

  useEffect(() => {
    if (autToken) {
      dispatch(setAutToken(autToken));
      pushRoute('/');
    }
    return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmitForm = async (data) => {
    await action({
      action: async () =>
        await post({
          url: API_LIST.login,
          data: { email: data.email, passWord: data.password },
        }),
      onSuccess: async ({ token }) => {
        if (!token) return;
        dispatch(setToken(token));
        localStorage.setItem('token', token);
        pushRoute('/');
      },
      onError: async () => {
        setErrorText('Username hoặc mật khẩu không đúng');
      },
    });
  };

  return (
    <div className='login-container'>
      <form className='login-form' onSubmit={handleSubmit(onSubmitForm)}>
        <h2 className='login-title'>𝓝𝓮𝓽𝓝𝓮𝓼𝓽</h2>
        <input
          className='login-email'
          type='text'
          name='email'
          placeholder='Email'
          {...register('email')}
        />
        <p className='login-errText'>{errors.email?.message}</p>
        <input
          className='login-password'
          rows='10'
          type='password'
          name='password'
          placeholder='Password'
          {...register('password')}
        />
        <p className='login-errText'>{errors.password?.message}</p>
        <Button btnType='submit' text='Login' className='login-button' />
        <a href='/register' className='login-dontHave'>
          Don't have an account?
        </a>
      </form>
    </div>
  );
};

export default LoginPage;
