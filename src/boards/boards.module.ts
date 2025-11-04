import { Module } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Board, BoardSchema, Column, ColumnSchema, Subtask, SubtaskSchema, Task, TaskSchema } from './schemas/board.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { ColumnService } from './column.service';
import { ColumnController } from './column.controller';
import { SubtaskService } from './subtasks.service';
import { SubtaskController } from './subtasks.controller';

@Module({
      imports: [
      ConfigModule,
        JwtModule.registerAsync({
          imports: [ConfigModule],
            useFactory: async (config: ConfigService) => ({
              secret: config.get<string>('JWT_SECRET'),
              signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN') },
            }),
            inject: [ConfigService],
        }),
      MongooseModule.forFeature(
        [{ name: Board.name, schema: BoardSchema },
          { name: User.name, schema: UserSchema },
          {name: Task.name,schema:TaskSchema},
          {name: Column.name,schema:ColumnSchema},
          {name: Subtask.name,schema:SubtaskSchema}
        ]), // <-- THIS LINE
    ],
  providers: [BoardsService,TasksService,ColumnService,SubtaskService],
  controllers: [BoardsController,TasksController,ColumnController,SubtaskController],
  exports: [BoardsService]
})
export class BoardsModule {}
