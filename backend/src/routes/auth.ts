import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { Request, Response } from 'express';
import { supabase, supabaseAdmin, passwordPolicy } from '../config/supabase';
import { User } from '@supabase/supabase-js';

const router = Router();
const prisma = new PrismaClient();

// Función para validar la contraseña según la política
const validatePassword = (password: string): boolean => {
  if (password.length < passwordPolicy.minLength) return false;
  if (passwordPolicy.requireNumbers && !/\d/.test(password)) return false;
  if (passwordPolicy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;
  if (passwordPolicy.requireUppercase && !/[A-Z]/.test(password)) return false;
  if (passwordPolicy.requireLowercase && !/[a-z]/.test(password)) return false;
  return true;
};

// Register validation middleware
const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: passwordPolicy.minLength })
    .withMessage(`Password must be at least ${passwordPolicy.minLength} characters long`)
    .custom((value) => {
      if (!validatePassword(value)) {
        throw new Error('Password does not meet security requirements');
      }
      return true;
    }),
  body('name').notEmpty().withMessage('Name is required'),
  body('role').isIn(['STUDENT', 'CLIENT']).withMessage('Invalid role'),
];

// Student specific validation
const studentValidation = [
  body('university').notEmpty().withMessage('University is required'),
  body('major').notEmpty().withMessage('Major is required'),
  body('graduationYear')
    .isInt({ min: new Date().getFullYear() })
    .withMessage('Invalid graduation year'),
];

// Register endpoint
router.post('/register', [...registerValidation], async (req: Request, res: Response) => {
  try {
    console.log('Registration request received:', { ...req.body, password: '[REDACTED]' });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, role } = req.body;

    // Check if user exists in Supabase using admin client
    console.log('Checking if user exists in Supabase...');
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('Supabase listUsers error:', listError);
      throw listError;
    }

    const existingSupabaseUser = users.some(
      (user: User) => user.email === email
    );
    
    if (existingSupabaseUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user in Supabase using admin client
    console.log('Creating user in Supabase...');
    const { data: supabaseData, error: supabaseError } = await supabaseAdmin.auth.admin.createUser({
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

    // Hash password for Prisma
    console.log('Creating user in Prisma...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in Prisma
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
    });

    // Create role-specific profile
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
    } else if (role === 'CLIENT') {
      const { company } = req.body;
      await prisma.client.create({
        data: {
          userId: user.id,
          company,
        },
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

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
  } catch (error) {
    console.error('Registration error:', error);
    // Rollback Supabase user if Prisma creation fails
    if (error instanceof Error && error.message) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(error.message);
      } catch (rollbackError) {
        console.error('Error during rollback:', rollbackError);
      }
    }
    res.status(500).json({ 
      message: 'Error registering user',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Login endpoint
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Authenticate with Supabase
      const { data: supabaseData, error: supabaseError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (supabaseError) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Get user from Prisma
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

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
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Error logging in' });
    }
  }
);

export default router; 