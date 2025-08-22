  import jwt from 'jsonwebtoken';

  const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

  export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided. Access d enied.' });
    }

    const token = authHeader.split(' ')[1];
    

    try {
      const decoded = jwt.verify(token, JWT_SECRET); // ✅ No algorithms array
      req.user = decoded;
      next();
    } catch (err) {
      console.error("❌ JWT verification failed:", err.message);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
  };
