"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../config/db"));
const register = async (req, res) => {
    try {
        const { email, password, first_name, last_name, age } = req.body;
        if (!email || !password) {
            res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
            return;
        }
        const existingUser = await db_1.default.query('SELECT user_id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            res.status(409).json({
                success: false,
                error: 'Email already registered'
            });
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const result = await db_1.default.query('INSERT INTO users (first_name, last_name, email, password_hash, age) VALUES ($1, $2, $3, $4, $5) RETURNING user_id, email, first_name', [first_name || '', last_name || '', email, hashedPassword, age || null]);
        const user = result.rows[0];
        const token = jsonwebtoken_1.default.sign({ id: user.user_id, email: user.email }, process.env.JWT_SECRET || 'default-secret-key-change-in-production', { expiresIn: '7d' });
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                id: user.user_id,
                email: user.email,
                name: user.first_name,
                token: token
            }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Registration failed'
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
            return;
        }
        const result = await db_1.default.query('SELECT user_id, email, password_hash, first_name, is_admin FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
            return;
        }
        const user = result.rows[0];
        const isValidPassword = await bcrypt_1.default.compare(password, user.password_hash);
        if (!isValidPassword) {
            res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.user_id, email: user.email, isAdmin: user.is_admin }, process.env.JWT_SECRET || 'default-secret-key-change-in-production', { expiresIn: '7d' });
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                customer: {
                    id: user.user_id,
                    email: user.email,
                    name: user.first_name,
                    isAdmin: user.is_admin
                }
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed'
        });
    }
};
exports.login = login;
//# sourceMappingURL=authController.js.map