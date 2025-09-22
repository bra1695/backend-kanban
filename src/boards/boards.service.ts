import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Board } from './schemas/board.schema';
import { CreateBoardDto } from './dto/create-board.dto';

@Injectable()
export class BoardsService {
  constructor(@InjectModel(Board.name) private boardModel: Model<Board>) {}

async create(dto: CreateBoardDto, userId: string): Promise<Board> {
  const newBoard = new this.boardModel({
    ...dto,
    createdBy: userId,
  });
  return newBoard.save();
}


  async findAll(): Promise<Board[]> {
    return this.boardModel.find().populate('teams').exec();
  }

  async findOne(slug: string): Promise<Board> {
    const board = await this.boardModel.findOne({ slug }).populate('teams').exec();
    if (!board) throw new NotFoundException('Board not found');
    return board;
  }

  async update(slug: string, dto: Partial<CreateBoardDto>) {
    return this.boardModel
      .findOneAndUpdate({ slug }, dto, { new: true })
      .populate('teams')
      .exec();
  }

  async remove(slug: string) {
    return this.boardModel.findOneAndDelete({ slug }).exec();
  }
}
