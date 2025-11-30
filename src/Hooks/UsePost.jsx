// src/hooks/usePost.js
import { useMutationHook } from './useMutationHook';

export const usePost = ({ url, invalidateKey, successMessage } = {}) => {
  const { mutate: postData, isPending: loadingPost } = useMutationHook({
    method: 'post',
    invalidateKey,
  });

  const execute = (data, { onSuccess, onError, successMessage: customMsg } = {}) => {
    postData({
      url,
      data,
      headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
      successMessage: customMsg ?? successMessage,
      onSuccess,
      onError,
    });
  };

  return { postData: execute, loadingPost };
};