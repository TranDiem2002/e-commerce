import { useNavigate } from 'react-router-dom';

export const useRouter = () => {
  const navigate = useNavigate();

  const pushRoute = (link) => {
    if (link) {
      navigate(link);
    }
  };

  return { pushRoute };
};
