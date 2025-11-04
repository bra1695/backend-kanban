import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { JwtService } from "@nestjs/jwt";
import { Model } from "mongoose";
import { Column, ColumnDocument } from "./schemas/board.schema";
import { User, UserDocument } from "../users/schemas/user.schema";
import { CreateColumnDto } from "./dto/create-column.dto";
import { UpdateColumnDto } from "./dto/update-column.dto";

@Injectable()
export class ColumnService {
  constructor(
    @InjectModel(Column.name) private readonly columnModel: Model<ColumnDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService
  ) {}

  // ✅ Create a new column
  async create(dto: CreateColumnDto, token: string): Promise<Column> {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.userModel.findById(decoded.sub);
      if (!user) throw new NotFoundException("User not found");

      const newColumn = new this.columnModel({
        ...dto,
        createdBy: user._id,
      });

      return await newColumn.save();
    } catch (err) {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }

  // ✅ Get all columns
  async findAll(token: string): Promise<Column[]> {
    const decoded = this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET,
    });

    const user = await this.userModel.findById(decoded.sub);
    if (!user) throw new NotFoundException("User not found");

    return this.columnModel.find().populate("createdBy", "name email").exec();
  }

  // ✅ Get one column by ID
  async findOne(id: string, token: string): Promise<Column> {
    const decoded = this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET,
    });

    const user = await this.userModel.findById(decoded.sub);
    if (!user) throw new NotFoundException("User not found");

    const column = await this.columnModel
      .findById(id)
      .populate("createdBy", "name email")
      .exec();

    if (!column) throw new NotFoundException("Column not found");
    return column;
  }

  // ✅ Delete column
  async remove(id: string, token: string) {
    const decoded = this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET,
    });

    const user = await this.userModel.findById(decoded.sub);
    if (!user) throw new NotFoundException("User not found");

    const deleted = await this.columnModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException("Column not found");

    return { message: "Column deleted successfully" };
  }

  // ✅ Update column
  async update(id: string, dto: UpdateColumnDto, token: string): Promise<Column> {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.userModel.findById(decoded.sub);
      if (!user) throw new NotFoundException("User not found");

      const column = await this.columnModel.findById(id);
      if (!column) throw new NotFoundException("Column not found");

      const updatedColumn = await this.columnModel
        .findByIdAndUpdate(id, dto, { new: true })
        .exec();
      // @ts-ignore
      return updatedColumn;
    } catch (err) {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}
