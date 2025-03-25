import { create } from 'zustand';

type TLoadingStore = {
  isLoading: boolean;
  setLoading: (isLoading: boolean) => void;
};

const useLoadingStore = create<TLoadingStore>((set) => ({
  isLoading: false,
  setLoading: (isLoading: boolean) => set({ isLoading }),
}));

export default useLoadingStore;
