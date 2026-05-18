import bcrypt from 'bcrypt';
import { registerUser, loginUser, getAllUsers, deleteUserById } from '../../../controllers/users.controller.js';
import * as usersModel from '../../../models/users.model.js';

jest.mock('../../../models/users.model.js');
jest.mock('bcrypt');

describe('Users Controller', () => {
  let req, res;

  beforeEach(() => {
    req = mockReq();
    res = mockRes();
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      req.body = {
        name: 'John Doe',
        email: 'john@example.com',
        mobile_No: '1234567890',
        address: '123 Main St',
        role: 'agent',
        password: 'Password123'
      };

      bcrypt.hash.mockResolvedValue('hashedPassword123');
      usersModel.adduser.mockResolvedValue(1);

      await registerUser(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith('Password123', 12);
      expect(usersModel.adduser).toHaveBeenCalledWith(req.db, {
        name: 'John Doe',
        email: 'john@example.com',
        mobile_No: '1234567890',
        address: '123 Main St',
        role: 'agent',
        password: 'hashedPassword123'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'User registered successfully',
        userId: 1
      });
    });

    it('should reject registration with missing fields', async () => {
      req.body = { name: 'John Doe' };

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'All fields are required' });
    });

    it('should reject registration with invalid email', async () => {
      req.body = {
        name: 'John Doe',
        email: 'invalid-email',
        mobile_No: '1234567890',
        address: '123 Main St',
        role: 'agent',
        password: 'Password123'
      };

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid email format' });
    });

    it('should reject registration with invalid mobile number', async () => {
      req.body = {
        name: 'John Doe',
        email: 'john@example.com',
        mobile_No: '123',
        address: '123 Main St',
        role: 'agent',
        password: 'Password123'
      };

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Mobile number must be 10-15 digits' });
    });

    it('should reject registration with weak password', async () => {
      req.body = {
        name: 'John Doe',
        email: 'john@example.com',
        mobile_No: '1234567890',
        address: '123 Main St',
        role: 'agent',
        password: 'weak'
      };

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Password must be at least 8 characters long' 
      });
    });

    it('should reject registration with invalid role', async () => {
      req.body = {
        name: 'John Doe',
        email: 'john@example.com',
        mobile_No: '1234567890',
        address: '123 Main St',
        role: 'invalid_role',
        password: 'Password123'
      };

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Invalid role. Must be one of: admin, agent, factory, call_agent' 
      });
    });

    it('should handle duplicate mobile number error', async () => {
      req.body = {
        name: 'John Doe',
        email: 'john@example.com',
        mobile_No: '1234567890',
        address: '123 Main St',
        role: 'agent',
        password: 'Password123'
      };

      bcrypt.hash.mockResolvedValue('hashedPassword123');
      usersModel.adduser.mockRejectedValue({ code: 'ER_DUP_ENTRY' });

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'User with this mobile number already exists' 
      });
    });
  });

  describe('loginUser', () => {
    it('should login user successfully with valid credentials', async () => {
      req.body = {
        mobile_No: '1234567890',
        password: 'Password123'
      };

      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        mobile_No: '1234567890',
        role: 'agent',
        password: 'hashedPassword123'
      };

      usersModel.getUserByMobile.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      await loginUser(req, res);

      expect(usersModel.getUserByMobile).toHaveBeenCalledWith(req.db, '1234567890');
      expect(bcrypt.compare).toHaveBeenCalledWith('Password123', 'hashedPassword123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Login successful',
        user: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          mobile_No: '1234567890',
          role: 'agent'
        }
      });
    });

    it('should reject login with missing fields', async () => {
      req.body = { mobile_No: '1234567890' };

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Mobile number and password are required' 
      });
    });

    it('should reject login with non-existent user', async () => {
      req.body = {
        mobile_No: '1234567890',
        password: 'Password123'
      };

      usersModel.getUserByMobile.mockResolvedValue(null);

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Invalid mobile number or password' 
      });
    });

    it('should reject login with incorrect password', async () => {
      req.body = {
        mobile_No: '1234567890',
        password: 'WrongPassword'
      };

      const mockUser = {
        id: 1,
        password: 'hashedPassword123'
      };

      usersModel.getUserByMobile.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Invalid mobile number or password' 
      });
    });
  });

  describe('getAllUsers', () => {
    it('should return all users successfully', async () => {
      const mockUsers = [
        { id: 1, name: 'User 1', role: 'agent' },
        { id: 2, name: 'User 2', role: 'factory' }
      ];

      usersModel.getUsers.mockResolvedValue(mockUsers);

      await getAllUsers(req, res);

      expect(usersModel.getUsers).toHaveBeenCalledWith(req.db);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        users: mockUsers
      });
    });

    it('should handle errors when fetching users', async () => {
      usersModel.getUsers.mockRejectedValue(new Error('Database error'));

      await getAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Error fetching users'
      });
    });
  });

  describe('deleteUserById', () => {
    it('should delete user successfully', async () => {
      req.params = { id: '2' };

      const mockUser = {
        id: 2,
        name: 'User 2',
        role: 'agent'
      };

      usersModel.getUserById.mockResolvedValue(mockUser);
      usersModel.deleteUser.mockResolvedValue(1);

      await deleteUserById(req, res);

      expect(usersModel.getUserById).toHaveBeenCalledWith(req.db, '2');
      expect(usersModel.deleteUser).toHaveBeenCalledWith(req.db, '2');
      expect(res.json).toHaveBeenCalledWith({ message: 'User deleted successfully' });
    });

    it('should return 404 if user not found', async () => {
      req.params = { id: '999' };

      usersModel.getUserById.mockResolvedValue(null);

      await deleteUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should prevent deletion of admin users', async () => {
      req.params = { id: '1' };

      const mockAdmin = {
        id: 1,
        name: 'Admin',
        role: 'admin'
      };

      usersModel.getUserById.mockResolvedValue(mockAdmin);

      await deleteUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Cannot delete admin user' });
      expect(usersModel.deleteUser).not.toHaveBeenCalled();
    });
  });
});
