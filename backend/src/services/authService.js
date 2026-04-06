import prisma from '../config/database.js';
import { hashPassword, comparePassword, generateToken } from '../utils/authUtils.js';

export const loginAdmin = async (email, password) => {
  const admin = await prisma.admin.findUnique({
    where: { email },
  });

  if (!admin) {
    throw new Error('Invalid credentials');
  }

  const isPasswordValid = await comparePassword(password, admin.passwordHash);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken(admin.id);

  return {
    token,
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
    },
  };
};

export const createAdmin = async (name, email, password) => {
  const passwordHash = await hashPassword(password);

  const admin = await prisma.admin.create({
    data: {
      name,
      email,
      passwordHash,
    },
  });

  return admin;
};

export const getAdminById = async (id) => {
  const admin = await prisma.admin.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  return admin;
};
