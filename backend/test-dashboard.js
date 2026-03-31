import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const token = jwt.sign({ id: 'test-user', role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
console.log("Token:", token);

fetch('http://localhost:5000/api/dashboard', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json()).then(data => console.log(data)).catch(e => console.error(e));
