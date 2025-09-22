import { Module } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Board, BoardSchema } from './schemas/board.schema';

@Module({
      imports: [
      MongooseModule.forFeature([{ name: Board.name, schema: BoardSchema }]), // <-- THIS LINE
    ],
  providers: [BoardsService],
  controllers: [BoardsController],
  exports: [BoardsService]
})
export class BoardsModule {}
