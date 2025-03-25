import useLoadingStore from '../store/loadingStore';

interface ActionParams<T> {
  isLoading?: boolean;
  action: () => Promise<T>;
  onError?: (error: unknown) => void;
  onSuccess?: (result: T) => Promise<void>;
}

export const useAction = () => {
  const { setLoading } = useLoadingStore();

  const action = async <T>({
    isLoading = true,
    action,
    onError,
    onSuccess,
  }: ActionParams<T>): Promise<void> => {
    try {
      if (isLoading) setLoading(true);
      const res = await action();
      if (onSuccess) await onSuccess(res || ({} as T));
    } catch (error) {
      if (onError) onError(error);
    } finally {
      if (isLoading) setLoading(false);
    }
  };

  const actionAll = async (
    funcs: Array<Promise<unknown>> = [],
  ): Promise<void> => {
    try {
      setLoading(true);
      await Promise.all(funcs);
    } finally {
      setLoading(false);
    }
  };

  return { action, actionAll, setLoading };
};
