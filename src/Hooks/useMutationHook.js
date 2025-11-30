// src/hooks/useMutationHook.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { toast } from 'react-toastify';

export const useMutationHook = ({ method = 'post', invalidateKey } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ url, data, headers }) => {
      const { data: res } = await api({ method, url, data, headers });
      return res;
    },
    onSuccess: (data, variables) => {
      if (variables.successMessage) {
        toast.success(variables.successMessage);
      }
      if (invalidateKey) {
        queryClient.invalidateQueries({ queryKey: invalidateKey });
      }
      variables.onSuccess?.(data);
    },
    onError: (error, variables) => {
      const msg = error?.response?.data?.message || error?.message || 'Invalid response from server';
      toast.error(msg);
      variables.onError?.(error);
    },
  });
};