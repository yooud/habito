import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  UseGuards,
  Req,
  Body,
  Param,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { FamilyService } from './family.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { RequestWithUser } from '../auth/types/request.types';
import { CreateFamilyDto } from './dto/create-family.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@Controller('family')
@UseGuards(FirebaseAuthGuard)
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Get()
  async getFamily(@Req() req: RequestWithUser) {
    const user = await this.familyService.getUserByUid(req.user.uid);
    if (!user || !user.familyId) {
      throw new NotFoundException('User is not associated with any family');
    }

    const familyWithMembers = await this.familyService.getFamilyWithMembers(
      user.familyId.toString(),
    );
    if (!familyWithMembers) {
      throw new NotFoundException('Family not found');
    }

    return familyWithMembers;
  }

  @Post()
  async createFamily(
    @Req() req: RequestWithUser,
    @Body() createFamilyDto: CreateFamilyDto,
  ) {
    return this.familyService.createFamily(req.user.uid, createFamilyDto);
  }

  @Post('members')
  async addMember(
    @Req() req: RequestWithUser,
    @Body() addMemberDto: AddMemberDto,
  ) {
    const user = await this.familyService.getUserByUid(req.user.uid);
    if (!user || !user.familyId) {
      throw new NotFoundException('User is not associated with any family');
    }

    if (user.role !== 'parent') {
      throw new BadRequestException('Only parents can add family members');
    }

    return this.familyService.addMember(user.familyId.toString(), addMemberDto);
  }

  @Patch('members/:memberId')
  async updateMember(
    @Req() req: RequestWithUser,
    @Param('memberId') memberId: string,
    @Body() updateDto: UpdateMemberDto,
  ) {
    const user = await this.familyService.getUserByUid(req.user.uid);
    if (!user || !user.familyId) {
      throw new NotFoundException('User is not associated with any family');
    }

    if (user.role !== 'parent') {
      throw new BadRequestException('Only parents can edit family members');
    }

    return this.familyService.updateMember(
      user.familyId.toString(),
      memberId,
      updateDto,
    );
  }

  @Delete()
  async deleteFamily(@Req() req: RequestWithUser) {
    const user = await this.familyService.getUserByUid(req.user.uid);
    if (!user || !user.familyId) {
      throw new NotFoundException('User is not associated with any family');
    }

    if (user.role !== 'parent') {
      throw new BadRequestException('Only parents can delete the family');
    }

    return this.familyService.deleteFamily(
      user.familyId.toString(),
      req.user.uid,
    );
  }
}
