// src/hooks/useGet.js
import { useQuery } from '@tanstack/react-query';
import api from '@/api/client';

export const useGet = ({ url, queryKey, enabled = true, pollInterval }) => {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await api.get(url);
      return data;
    },
    enabled,
    refetchInterval: pollInterval,
    staleTime: 5 * 60 * 1000,
  });
};