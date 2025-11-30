// src/hooks/useDelete.js
import { useMutationHook } from './useMutationHook';

export const useDelete = (invalidateKey) => {
  const { mutate: deleteData, isPending: loadingDelete } = useMutationHook({
    method: 'delete',
    invalidateKey,
  });

  return { deleteData, loadingDelete };
};