// src/hooks/useChangeState.js
import { useMutationHook } from './useMutationHook';

export const useChangeState = (invalidateKey) => {
  const { mutate: changeState, isPending: loadingChange } = useMutationHook({
    method: 'put',
    invalidateKey,
  });

  return { changeState, loadingChange };
};