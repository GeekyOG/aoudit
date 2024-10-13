import Cookies from 'js-cookie';

export const logout = () => {
  
  Cookies.remove('authToken');
  Cookies.remove("refreshToken");

  window.location.href = '/';
};
