import User from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Email tidak terdaftar!' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Password salah!' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'rahasia_super_aman_untuk_token_hotel',
            { expiresIn: '1d' }
        );

        return res.status(200).json({ 
            token, 
            id: user.id,
            role: user.role, 
            nama: user.nama || 'User',
            message: 'Login berhasil' 
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};