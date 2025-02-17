import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../../schemas/user';
import { CreateUserDto, UpdateUserDto } from './_dto/user.dto';
import { UserTableDto } from './_dto/user-table.dto';
import { LoginUserDto, UserResponseDto } from '../auth/_dto/auth.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async create(userData: CreateUserDto): Promise<UserResponseDto> {
    // Hash password before saving
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const userDoc = await new this.userModel({
      ...userData,
      password: hashedPassword,
    }).save();

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

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    // If password is being updated, hash it
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

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

  async deleteMany(ids: string[]): Promise<void> {
    await this.userModel.deleteMany({ _id: { $in: ids } }).exec();
  }

  async checkUsername(username: string): Promise<boolean> {
    const user = await this.userModel.findOne({ username }).exec();
    return !!user;
  }

  async checkEmail(email: string): Promise<boolean> {
    const user = await this.userModel.findOne({ email }).exec();
    return !!user;
  }

  async login(loginUserDto: LoginUserDto): Promise<UserResponseDto> {
    const user = (await this.userModel
      .findOne({ email: loginUserDto.email })
      .exec()) as UserDocument;

    if (
      !user ||
      !(await bcrypt.compare(loginUserDto.password, user.password))
    ) {
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
}
