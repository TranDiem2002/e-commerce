import { API_LIST } from '../constants/common';
import { putFormData, upload } from './request';

export const createSpeaker = async ({ file, request, token_dev, authorization }) => {
    const data = new FormData();

    if (file) {
        data.append('file', file);
    }

    if (request) {
        data.append("fullName",request.fullName);
        data.append("title",request.title);
        data.append("bio",request.bio);
        data.append("createdTime",Date.now());
    }

    const response = await upload({
        url: API_LIST.SPEAKER.create_speaker,
        data,
        config: {
            headers: {authorization,  token_dev },
        },
    });

    return response;
};

export const editSpeaker = async ({ file, request, token_dev, authorization }) => {
  const data = new FormData();

  if (file) {
      data.append('file', file);
  }

  if (request) {
      data.append("fullName",request.fullName);
      data.append("title",request.title);
      data.append("bio",request.bio);
      data.append("createdTime",Date.now());
  }

  const response = await putFormData({
      url: API_LIST.SPEAKER.edit_speaker,
      data,
      config: {
          headers: { authorization, token_dev },
      },
  });

  return response;
};
