import axiosBase from 'axios';

const initRequest = () => {
  const headers = {
    'Content-Type': 'application/json',
    token_form_dev: process.env.REACT_APP_API_KEY,
    Authorization: 'Bearer' + process.env.REACT_APP_API_KEY,
    'Access-Control-Allow-Origin': '*',
  };

  const axios = axiosBase.create({
    // baseURL: 'http://localhost:70',
    baseURL: process.env.REACT_APP_BASE_URL,
    // withCredentials: true,
    headers,
  });

  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      console.warn('▼Api Error▼', error);
    },
  );

  return axios;
};

const generateUrl = (url, params) => {
  let genUrl = url;
  if (params) {
    const keys = Object.keys(params);
    if (keys.length > 0) {
      for (const key of keys) {
        genUrl = genUrl.replace(`{${key}}`, params[key]);
      }
    }
  }
  return genUrl;
};

const generateQueryString = (query) => {
  if (!query) return '';
  const keys = Object.keys(query);
  if (keys.length > 0) {
    const qString = [];
    for (const key of keys) {
      qString.push(`${key}=${query[key]}`);
    }
    return `?${qString.join('&')}`;
  }
  return '';
};

const request = async (callback, reqOption) => {
  try {
    const { url, params } = reqOption;
    const genUrl = generateUrl(url, params);
    const axios = initRequest();
    const response = await callback(axios, genUrl);
    return response.data;
  } catch (error) {
    console.warn('▼Api Error▼', error);
    // return undefined;
  }
};

export const get = async (reqOption) => {
  return await request((axios, genUrl) => {
    return axios.get(
      `${genUrl}${generateQueryString(reqOption.query)}`,
      reqOption.config,
    );
  }, reqOption);
};

export const post = async (reqOption) => {
  return await request((axios, genUrl) => {
    return axios.post(genUrl, reqOption.data, reqOption.config);
  }, reqOption);
};

export const put = async (reqOption) => {
  return await request((axios, genUrl) => {
    return axios.put(genUrl, reqOption.data, reqOption.config);
  }, reqOption);
};

export const deleteMethod = async (reqOption) => {
  return await request((axios, genUrl) => {
    return axios.delete(genUrl, reqOption.config);
  }, reqOption);
};

export const upload = async (reqOption) => {
  return await request((axios, genUrl) => {
    return axios.post(genUrl, reqOption.data, {
      ...reqOption.config,
      headers: {
        ...reqOption.config?.headers,
        'Content-type': 'multipart/form-data',
      },
    });
  }, reqOption);
};

export const putFormData = async (reqOption) => {
  return await request((axios, genUrl) => {
    return axios.put(genUrl, reqOption.data, {
      ...reqOption.config,
      headers: {
        ...reqOption.config?.headers,
        'Content-type': 'multipart/form-data',
      },
    });
  }, reqOption);
};
