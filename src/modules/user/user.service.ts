import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user';
import { CreateUserDto, UpdateUserDto } from './_dto/user.dto';
import { UserTableDto } from './_dto/user-table.dto';
import { LoginUserDto, UserResponseDto } from './_dto/auth.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const userDoc = await new this.userModel(createUserDto).save();
    const user = userDoc as UserDocument;
    
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      profilePicture: user.profilePicture,
      status: user.status,
      phoneNumber: user.phoneNumber,
    };
  }

  async findAll(page: number, limit: number): Promise<UserTableDto> {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.userModel.find().skip(skip).limit(limit).exec(),
      this.userModel.countDocuments().exec(),
    ]);

    const usersWithPosition = users.map((user, index) => ({
      ...user.toObject(),
      position: skip + index + 1,
    }));

    // await new Promise<void>((resolve) => setTimeout(resolve, 3000));
    return new UserTableDto(usersWithPosition, page, limit, total);
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const userDoc = await this.userModel.findById(id).exec();
    if (!userDoc) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    const user = userDoc as UserDocument;
    
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      profilePicture: user.profilePicture,
      status: user.status,
      phoneNumber: user.phoneNumber,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const userDoc = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
    if (!userDoc) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    const user = userDoc as UserDocument;
    
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      profilePicture: user.profilePicture,
      status: user.status,
      phoneNumber: user.phoneNumber,
    };
  }

  async delete(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async checkUsername(username: string): Promise<boolean> {
    const user = await this.userModel.findOne({ username: username }).exec();
    return !!user;
  }

  async checkEmail(email: string): Promise<boolean> {
    const user = await this.userModel.findOne({ email }).exec();
    return !!user;
  }

  async login(loginUserDto: LoginUserDto): Promise<UserResponseDto> {
    const user = await this.userModel.findOne({ email: loginUserDto.email }).exec() as UserDocument;
    
    if (!user || user.password !== loginUserDto.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      profilePicture: user.profilePicture,
      status: user.status,
      phoneNumber: user.phoneNumber,
    };
  }

  async getCurrentUser(userId: string): Promise<UserResponseDto> {
    const user = await this.findOne(userId) as UserDocument;
    
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      profilePicture: user.profilePicture,
      status: user.status,
      phoneNumber: user.phoneNumber,
    };
  }

  async logout(): Promise<{ message: string }> {
    return { message: 'Successfully logged out' };
  }
}
