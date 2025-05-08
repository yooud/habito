import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Family } from '../schemas/family.schema';
import { User } from '../schemas/user.schema';
import { CreateFamilyDto } from './dto/create-family.dto';
import { AddMemberDto } from './dto/add-member.dto';

@Injectable()
export class FamilyService {
  constructor(
    @InjectModel(Family.name) private familyModel: Model<Family>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async getUserByUid(uid: string) {
    return this.userModel.findOne({ uid });
  }

  async createFamily(uid: string, createFamilyDto: CreateFamilyDto) {
    const user = await this.userModel.findOne({ uid });
    if (!user) {
      throw new ConflictException('User not found');
    }
    if (user.familyId) {
      throw new ConflictException('User already belongs to a family');
    }

    const family = await this.familyModel.create({
      name: createFamilyDto.name,
    });

    await this.userModel.findByIdAndUpdate(user._id, {
      familyId: family._id,
      role: 'parent',
    });

    return this.getFamilyWithMembers(family._id as unknown as string);
  }

  async addMember(familyId: string, addMemberDto: AddMemberDto) {
    const family = await this.familyModel.findById(familyId);
    if (!family) {
      throw new NotFoundException('Family not found');
    }

    const user = await this.userModel.findOne({ email: addMemberDto.email });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.familyId) {
      throw new ConflictException('User already belongs to a family');
    }

    await this.userModel.findByIdAndUpdate(user._id, {
      familyId,
      role: addMemberDto.role,
    });

    return this.getFamilyWithMembers(familyId);
  }

  async deleteFamily(familyId: string, uid: string) {
    const family = await this.familyModel.findById(familyId);
    if (!family) {
      throw new NotFoundException('Family not found');
    }

    const user = await this.userModel.findOne({ uid, familyId });
    if (!user) {
      throw new NotFoundException('User not found in this family');
    }
    if (user.role !== 'parent') {
      throw new BadRequestException('Only parents can delete the family');
    }

    await this.userModel.updateMany(
      { familyId },
      { $set: { familyId: null, role: null } }
    );

    await this.familyModel.findByIdAndDelete(familyId);

    return { message: 'Family deleted successfully' };
  }

  async getFamilyWithMembers(familyId: string) {
    const family = await this.familyModel.findById(familyId);
    if (!family) {
      return null;
    }

    const members = await this.userModel.find({ familyId });
    
    return {
      family,
      members: members.map(member => ({
        id: member._id,
        uid: member.uid,
        email: member.email,
        name: member.name,
        role: member.role,
      })),
    };
  }
} 