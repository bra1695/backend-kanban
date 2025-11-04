import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Board, BoardDocument } from './schemas/board.schema';
import { CreateBoardDto } from './dto/create-board.dto';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class BoardsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Board.name) private boardModel: Model<BoardDocument>,
    private jwtService: JwtService,
  ) {}

  private async verifyAndGetUser(token: string): Promise<UserDocument> {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      const user = await this.userModel.findById(decoded.sub);
      if (!user) throw new NotFoundException('User not found');
      return user;
    } catch (err) {
      if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid or expired token');
      }
      throw err;
    }
  }

  // -------------------- CREATE --------------------
  async create(dto: CreateBoardDto, token: string): Promise<Board> {
    const user = await this.verifyAndGetUser(token);

    const newBoard = new this.boardModel({
      ...dto,
      createdBy: user._id,
    });

    try {
      return await newBoard.save();
    } catch (err) {
      throw new BadRequestException('Unable to create board');
    }
  }

  // -------------------- FIND ALL --------------------
  async findAll(token: string): Promise<Board[]> {
    const user = await this.verifyAndGetUser(token);
    return this.boardModel
      .find({ createdBy: user._id })
      .populate('teams')
      .exec();
  }

  // -------------------- FIND ONE --------------------
  async findOne(slug: string, token: string): Promise<Board> {
    const user = await this.verifyAndGetUser(token);
    const board = await this.boardModel
      .findOne({ slug, createdBy: user._id })
      .populate('teams')
      .exec();

    if (!board) throw new NotFoundException('Board not found');
    return board;
  }

  // -------------------- UPDATE --------------------
  async update(slug: string, dto: Partial<CreateBoardDto>, token: string): Promise<Board> {
    const user = await this.verifyAndGetUser(token);

    const board = await this.boardModel
      .findOneAndUpdate({ slug, createdBy: user._id }, dto, { new: true })
      .populate('teams')
      .exec();

    if (!board) throw new NotFoundException('Board not found or not authorized');
    return board;
  }

  // -------------------- DELETE --------------------
  async remove(slug: string, token: string): Promise<{ message: string }> {
    const user = await this.verifyAndGetUser(token);
    const deleted = await this.boardModel.findOneAndDelete({ slug, createdBy: user._id }).exec();

    if (!deleted) throw new NotFoundException('Board not found or not authorized');
    return { message: 'Board deleted successfully' };
  }

  // -------------------- ADD COLUMN --------------------
  async addNewColumn(slug: string, token: string, columnData: any) {
    const user = await this.verifyAndGetUser(token);
    const board = await this.boardModel.findOne({ slug, createdBy: user._id });

    if (!board) throw new NotFoundException('Board not found');

    // ✅ Add one new column instead of replacing all
    board.columns.push({
      ...columnData,
      createdBy: user._id,
    });

    await board.save();
    return board;
  }
}
