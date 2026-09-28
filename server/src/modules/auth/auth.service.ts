import User, { IUser } from '../../models/User';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';

export const registerUser = async (data: Partial<IUser>) => {
  const { fullName, email, password } = data;

  if (!fullName || !email || !password) {
    throw new Error('Please provide all required fields (fullName, email, password)');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('Email already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    fullName,
    email,
    password: hashedPassword,
  });

  const userResponse: any = user.toObject();
  delete userResponse.password;

  return userResponse;
};

export const loginUser = async (data: Partial<IUser>) => {
  const { email, password } = data;

  if (!email || !password) {
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password as string);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign(
    { id: user._id }, 
    process.env.JWT_SECRET as string, 
    { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'] }
  );

  const userResponse: any = user.toObject();
  delete userResponse.password;

  return { token, user: userResponse };
};
