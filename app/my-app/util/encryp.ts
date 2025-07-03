import CryptoJS from 'crypto-js';

export const encryptDataAES = (
  data: { email: string; passWord: string },
  key: string,
  ivBase64: string
) => {
  const dataString = JSON.stringify(data);
  const keyWordArray = CryptoJS.enc.Utf8.parse(key);
  const ivWordArray = CryptoJS.enc.Base64.parse(ivBase64);

  const encrypted = CryptoJS.AES.encrypt(dataString, keyWordArray, {
    iv: ivWordArray,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return {
    encryptedData: encrypted.toString(),
    iv: ivBase64,
  };
};
