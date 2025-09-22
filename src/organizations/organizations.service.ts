import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Organization, OrganizationDocument } from './schemas/organization.schemas';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectModel(Organization.name) private orgModel: Model<OrganizationDocument>,
  ) {}

  async create(dto: CreateOrganizationDto): Promise<Organization> {
    const org = new this.orgModel(dto);
    return org.save();
  }

  async findAll(): Promise<Organization[]> {
    return this.orgModel.find().exec();
  }

  async findOne(id: string): Promise<Organization> {
    const org = await this.orgModel.findById(id).exec();
    if (!org) throw new NotFoundException(`Organization with id ${id} not found`);
    return org;
  }

  async update(id: string, dto: UpdateOrganizationDto): Promise<Organization> {
    const org = await this.orgModel.findByIdAndUpdate(id, dto, { new: true });
    if (!org) throw new NotFoundException(`Organization with id ${id} not found`);
    return org;
  }

  async delete(id: string): Promise<{ deleted: boolean }> {
    const result = await this.orgModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException(`Organization with id ${id} not found`);
    return { deleted: true };
  }
}
