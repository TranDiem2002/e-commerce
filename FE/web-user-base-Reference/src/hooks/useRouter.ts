import { useLocation, useNavigate } from 'react-router-dom';

const useRouter = (onSameRoute?: () => void) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isSameRoute = (url: string): boolean | string => {
    return url && location.pathname === url;
  };

  const pushLocation = (url: string): void => {
    if (url) {
      window.location.href = url;
    }
  };

  const pushBlank = (url: string): void => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  const pushRoute = (url: string): void => {
    if (url) {
      navigate(url);
    }
  };

  const _isSameRoute = (url: string): boolean | string => {
    const isSame = isSameRoute(url);
    if (isSame && onSameRoute) {
      onSameRoute();
    }
    return isSame;
  };

  const pushSameRoute = (url: string): void => {
    if (!_isSameRoute(url)) {
      pushRoute(url);
    }
  };

  const pushUrl = (link: {
    url: string;
    location?: boolean;
    blank?: boolean;
  }): void => {
    if (link) {
      const { url, location, blank } = link;
      if (url) {
        if (location) return pushLocation(url);
        if (blank) return pushBlank(url);
        pushSameRoute(url);
      }
    }
  };

  return {
    pushLocation,
    pushBlank,
    pushRoute,
    pushSameRoute,
    pushUrl,
    isSameRoute,
  };
};

export default useRouter;
