import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Family } from '../schemas/family.schema';
import { User } from '../schemas/user.schema';
import { CreateFamilyDto } from './dto/create-family.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

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

    return this.getFamilyWithMembers((family._id as Types.ObjectId).toString());
  }

  async addMember(familyId: string, addMemberDto: AddMemberDto) {
    const familyObjectId = new Types.ObjectId(familyId);
    const family = await this.familyModel.findById(familyObjectId);
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
      familyId: familyObjectId,
      role: addMemberDto.role,
    });

    return this.getFamilyWithMembers(familyId);
  }

  async updateMember(
    familyId: string,
    memberId: string,
    updateDto: UpdateMemberDto,
  ) {
    const familyObjectId = new Types.ObjectId(familyId);
    const family = await this.familyModel.findById(familyObjectId);
    if (!family) {
      throw new NotFoundException('Family not found');
    }

    let memberObjectId: Types.ObjectId;
    try {
      memberObjectId = new Types.ObjectId(memberId);
    } catch {
      throw new BadRequestException('Invalid memberId format');
    }

    const member = await this.userModel.findOne({
      _id: memberObjectId,
      familyId: familyObjectId,
    });
    if (!member) {
      throw new NotFoundException('User not found in this family');
    }

    const updateData: Partial<Pick<User, 'name' | 'role'>> = {};
    if (updateDto.name !== undefined) {
      updateData.name = updateDto.name;
    }
    if (updateDto.role !== undefined) {
      updateData.role = updateDto.role;
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('No fields to update');
    }

    await this.userModel.findByIdAndUpdate(memberObjectId, {
      $set: updateData,
    });

    return this.getFamilyWithMembers(familyId);
  }

  async deleteFamily(familyId: string, uid: string) {
    const familyObjectId = new Types.ObjectId(familyId);
    const family = await this.familyModel.findById(familyObjectId);
    if (!family) {
      throw new NotFoundException('Family not found');
    }

    const user = await this.userModel.findOne({
      uid,
      familyId: familyObjectId,
    });
    if (!user) {
      throw new NotFoundException('User not found in this family');
    }
    if (user.role !== 'parent') {
      throw new BadRequestException('Only parents can delete the family');
    }

    await this.userModel.updateMany(
      { familyId: familyObjectId },
      { $set: { familyId: null, role: null } },
    );

    await this.familyModel.findByIdAndDelete(familyObjectId);

    return { message: 'Family deleted successfully' };
  }

  async getFamilyWithMembers(familyId: string) {
    const familyObjectId = new Types.ObjectId(familyId);
    const family = await this.familyModel.findById(familyObjectId);
    if (!family) {
      return null;
    }

    const members = await this.userModel.find({ familyId: familyObjectId });

    return {
      family,
      members: members.map((member) => ({
        id: member._id,
        uid: member.uid,
        email: member.email,
        name: member.name,
        role: member.role,
        points: member.points,
      })),
    };
  }
}
