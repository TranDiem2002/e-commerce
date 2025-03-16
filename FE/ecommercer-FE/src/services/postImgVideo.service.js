import { API_LIST } from '../contants/common';
import { upload } from './request';

export const updateImage_Video = async ({ file, fileType, token, postId }) => {
  const data = new FormData();
  const url = `${postId}${
    fileType === 'image'
      ? API_LIST.post_update_image_post
      : API_LIST.post_update_video_post
  }`;

  if (fileType === 'image') {
    data.append('image', file);
  } else {
    data.append('video', file);
  }

  const response = await upload({
    url,
    data,
    config: {
      headers: { authorization: 'Bearer ' + token },
    },
  });

  return response;
};
