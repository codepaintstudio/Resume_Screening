
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'member';
  password: string; // In a real app, this should be hashed
  avatar?: string;
  department?: string;
}

// Mock users
export const users: User[] = [
  {
    id: '1',
    email: 'admin@mahui.com',
    name: 'Admin User',
    role: 'admin',
    password: 'password123',
    department: '办公室'
  },
  {
    id: '2',
    email: 'hr@mahui.com',
    name: 'HR User',
    role: 'member',
    password: 'password123',
    department: '办公室'
  },
  {
    id: '3',
    email: 'dev@mahui.com',
    name: 'Dev User',
    role: 'member',
    password: 'password123',
    department: '前端部'
  }
];

export const authenticateUser = (email: string, password: string) => {
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
};

export const addUser = (user: Omit<User, 'id'>) => {
  const newUser = { ...user, id: Date.now().toString() };
  users.push(newUser);
  return newUser;
};

export const checkUserExists = (email: string) => {
  return users.some(u => u.email === email);
};
