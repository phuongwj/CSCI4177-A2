import pool from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const logIn = async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const logInQuery = `
        SELECT 
            id, email, password_hash, first_name, last_name
        FROM 
            user
        WHERE 
            email = ?
    `;
    
    const [rows] = await pool.query(logInQuery, [email.toLowerCase().trim()]);
    const user = rows[0];

    if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    const accessToken = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });

    return res.status(200).json({
        accessToken,
        user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name
        }
    });
}