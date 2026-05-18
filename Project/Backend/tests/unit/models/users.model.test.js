import {
  adduser,
  getUserByMobile,
  getUsers,
  getFactoryEmployees,
  getUserById,
  deleteUser
} from '../../../models/users.model.js';

describe('Users Model', () => {
  let mockDb;

  beforeEach(() => {
    mockDb = {
      query: jest.fn()
    };
  });

  describe('adduser', () => {
    it('should insert a new user and return insertId', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        mobile_No: '1234567890',
        address: '123 Main St',
        role: 'agent',
        password: 'hashedPassword'
      };

      mockDb.query.mockResolvedValue([{ insertId: 1 }]);

      const result = await adduser(mockDb, userData);

      expect(mockDb.query).toHaveBeenCalledWith(
        "INSERT INTO users (name,email,mobile_No,address,role,password) VALUES (?, ?, ?, ?, ?, ?)",
        ['John Doe', 'john@example.com', '1234567890', '123 Main St', 'agent', 'hashedPassword']
      );
      expect(result).toBe(1);
    });
  });

  describe('getUserByMobile', () => {
    it('should return user by mobile number', async () => {
      const mockUser = {
        id: 1,
        name: 'John Doe',
        mobile_No: '1234567890',
        password: 'hashedPassword'
      };

      mockDb.query.mockResolvedValue([[mockUser]]);

      const result = await getUserByMobile(mockDb, '1234567890');

      expect(mockDb.query).toHaveBeenCalledWith(
        "SELECT id, name, email, mobile_No, address, role, password FROM users WHERE mobile_No = ?",
        ['1234567890']
      );
      expect(result).toEqual(mockUser);
    });

    it('should return undefined if user not found', async () => {
      mockDb.query.mockResolvedValue([[]]);

      const result = await getUserByMobile(mockDb, '9999999999');

      expect(result).toBeUndefined();
    });
  });

  describe('getUsers', () => {
    it('should return all non-admin users', async () => {
      const mockUsers = [
        { id: 2, name: 'Agent 1', role: 'agent' },
        { id: 3, name: 'Factory 1', role: 'factory' }
      ];

      mockDb.query.mockResolvedValue([mockUsers]);

      const result = await getUsers(mockDb);

      expect(mockDb.query).toHaveBeenCalledWith(
        "SELECT * FROM users where role!='admin' ORDER BY id DESC"
      );
      expect(result).toEqual(mockUsers);
    });
  });

  describe('getFactoryEmployees', () => {
    it('should return only factory role users', async () => {
      const mockFactoryUsers = [
        { id: 3, name: 'Factory 1', role: 'factory' },
        { id: 4, name: 'Factory 2', role: 'factory' }
      ];

      mockDb.query.mockResolvedValue([mockFactoryUsers]);

      const result = await getFactoryEmployees(mockDb);

      expect(mockDb.query).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE role = 'factory' ORDER BY id DESC"
      );
      expect(result).toEqual(mockFactoryUsers);
    });
  });

  describe('getUserById', () => {
    it('should return user by ID', async () => {
      const mockUser = { id: 1, name: 'John Doe', role: 'agent' };

      mockDb.query.mockResolvedValue([[mockUser]]);

      const result = await getUserById(mockDb, 1);

      expect(mockDb.query).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE id = ?",
        [1]
      );
      expect(result).toEqual(mockUser);
    });

    it('should return undefined if user not found', async () => {
      mockDb.query.mockResolvedValue([[]]);

      const result = await getUserById(mockDb, 999);

      expect(result).toBeUndefined();
    });
  });

  describe('deleteUser', () => {
    it('should delete user and return affected rows', async () => {
      mockDb.query.mockResolvedValue([{ affectedRows: 1 }]);

      const result = await deleteUser(mockDb, 2);

      expect(mockDb.query).toHaveBeenCalledWith(
        "DELETE FROM users WHERE id = ?",
        [2]
      );
      expect(result).toBe(1);
    });

    it('should return 0 if user not found', async () => {
      mockDb.query.mockResolvedValue([{ affectedRows: 0 }]);

      const result = await deleteUser(mockDb, 999);

      expect(result).toBe(0);
    });
  });
});
