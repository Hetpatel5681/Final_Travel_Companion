import User, { IUser } from '../../models/User';
import bcrypt from 'bcryptjs';

export const getProfile = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  
  const userResponse: any = user.toObject();
  delete userResponse.password;
  return userResponse;
};

export const updateProfile = async (userId: string, updateData: Partial<IUser>) => {
  // Extract and disallow restricted update fields natively
  const { email, password, role, isVerified, ...allowedUpdates } = updateData as any;
  
  const updatedUser = await User.findByIdAndUpdate(userId, allowedUpdates, { new: true, runValidators: true });
  if (!updatedUser) throw new Error('User not found');
  
  const userResponse: any = updatedUser.toObject();
  delete userResponse.password;
  return userResponse;
};

export const changePassword = async (userId: string, { oldPassword, newPassword }: any) => {
  if (!oldPassword || !newPassword) throw new Error('Please provide old and new password');
  
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  
  const isMatch = await bcrypt.compare(oldPassword, user.password as string);
  if (!isMatch) throw new Error('Incorrect old password');
  
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();
};

export const deleteAccount = async (userId: string) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) throw new Error('User not found');
};
