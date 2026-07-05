import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) return res.status(401).json({ status: 'error', message: 'Akses ditolak. Anda belum login!' });

    jwt.verify(token, process.env.JWT_SECRET || 'rahasia_super_aman_untuk_token_hotel', (err, decoded) => {
        if (err) return res.status(403).json({ status: 'error', message: 'Sesi berakhir atau token tidak valid!' });
        req.user = decoded; 
        next(); 
    });
};

export const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ status: 'error', message: 'Akses ditolak. Khusus Administrator!' });
    }
    next();
};