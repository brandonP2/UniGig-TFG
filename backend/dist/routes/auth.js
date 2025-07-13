"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const supabase_1 = require("../config/supabase");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const validatePassword = (password) => {
    if (password.length < supabase_1.passwordPolicy.minLength)
        return false;
    if (supabase_1.passwordPolicy.requireNumbers && !/\d/.test(password))
        return false;
    if (supabase_1.passwordPolicy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password))
        return false;
    if (supabase_1.passwordPolicy.requireUppercase && !/[A-Z]/.test(password))
        return false;
    if (supabase_1.passwordPolicy.requireLowercase && !/[a-z]/.test(password))
        return false;
    return true;
};
const registerValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .isLength({ min: supabase_1.passwordPolicy.minLength })
        .withMessage(`Password must be at least ${supabase_1.passwordPolicy.minLength} characters long`)
        .custom((value) => {
        if (!validatePassword(value)) {
            throw new Error('Password does not meet security requirements');
        }
        return true;
    }),
    (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('role').isIn(['STUDENT', 'CLIENT']).withMessage('Invalid role'),
];
const studentValidation = [
    (0, express_validator_1.body)('university').notEmpty().withMessage('University is required'),
    (0, express_validator_1.body)('major').notEmpty().withMessage('Major is required'),
    (0, express_validator_1.body)('graduationYear')
        .isInt({ min: new Date().getFullYear() })
        .withMessage('Invalid graduation year'),
];
router.post('/register', [...registerValidation], async (req, res) => {
    try {
        console.log('Registration request received:', Object.assign(Object.assign({}, req.body), { password: '[REDACTED]' }));
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password, name, role } = req.body;
        console.log('Checking if user exists in Supabase...');
        const { data: { users }, error: listError } = await supabase_1.supabaseAdmin.auth.admin.listUsers();
        if (listError) {
            console.error('Supabase listUsers error:', listError);
            throw listError;
        }
        const existingSupabaseUser = users.some((user) => user.email === email);
        if (existingSupabaseUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        console.log('Creating user in Supabase...');
        const { data: supabaseData, error: supabaseError } = await supabase_1.supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                name,
                role,
            },
        });
        if (supabaseError) {
            console.error('Supabase signUp error:', supabaseError);
            throw supabaseError;
        }
        console.log('Creating user in Prisma...');
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role,
            },
        });
        console.log('Creating role-specific profile...');
        if (role === 'STUDENT') {
            const { university, major, graduationYear } = req.body;
            await prisma.student.create({
                data: {
                    userId: user.id,
                    university,
                    major,
                    graduationYear,
                },
            });
        }
        else if (role === 'CLIENT') {
            const { company } = req.body;
            await prisma.client.create({
                data: {
                    userId: user.id,
                    company,
                },
            });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
        console.log('Registration successful');
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        if (error instanceof Error && error.message) {
            try {
                await supabase_1.supabaseAdmin.auth.admin.deleteUser(error.message);
            }
            catch (rollbackError) {
                console.error('Error during rollback:', rollbackError);
            }
        }
        res.status(500).json({
            message: 'Error registering user',
            error: error instanceof Error ? error.message : String(error)
        });
    }
});
router.post('/login', [
    (0, express_validator_1.body)('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        const { data: supabaseData, error: supabaseError } = await supabase_1.supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (supabaseError) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
        res.json({
            message: 'Logged in successfully',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map