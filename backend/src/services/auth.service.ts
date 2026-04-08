import prisma from '../prisma';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt';


export class AuthService {
  async register(data: any) {
    const { email, password, nickname } = data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('ERR_EMAIL_DUPLICATE');
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        password_hash,
        nickname
      }
    });

    const accessToken = generateToken(user.id);
    return { userId: user.id, accessToken };
  }

  async login(data: any) {
    const { email, password } = data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || (!user.password_hash)) {
      throw new Error('ERR_INVALID_CREDENTIALS');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error('ERR_INVALID_CREDENTIALS');
    }

    const accessToken = generateToken(user.id);
    return { accessToken, expiresIn: 3600 };
  }
}

export const authService = new AuthService();
