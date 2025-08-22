import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RedirectAfterLogin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/sign-in');
      return;
    }

    // Decode token payload (use a library or simple base64 parse)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload.role || 'student';

      switch (role) {
        case 'admin':
          navigate('/admin-dashboard');
          break;
        case 'teacher':
          navigate('/teacher-dashboard');
          break;
        default:
          navigate('/student-dashboard');
          break;
      }
    } catch {
      // Invalid token
      localStorage.removeItem('token');
      navigate('/sign-in');
    }
  }, [navigate]);

  return null;
};

export default RedirectAfterLogin;
