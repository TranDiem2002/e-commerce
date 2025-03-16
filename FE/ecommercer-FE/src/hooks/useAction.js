import { useDispatch } from 'react-redux';
// import { setLoading } from '../../state/page';

export const useAction = () => {
    const dispatch = useDispatch();

    const action = async({ isLoading = true, action, onError, onSuccess, isError = true }) => {
        try {
            // isLoading && dispatch(setLoading(true));
            const res = await action();
            onSuccess && (await onSuccess(res || {}));
        } catch (error) {
            onError && onError(error);
        } finally {
            // isLoading && dispatch(setLoading(false));
        }
    };

    const actionAll = async(funcs = []) => {
        try {
            // dispatch(setLoading(true));
            await Promise.all(funcs);
        } catch (error) {} finally {
            // dispatch(setLoading(false));
        }
    };

    return { action, actionAll, dispatch };
};