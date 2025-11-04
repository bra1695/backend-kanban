import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Put,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from "../common/decorators/roles.decorator";
import { Role } from "../common/enums/role.enum";
import { RolesGuard } from "../common/guards/roles.guard";
import { ColumnService } from "./column.service";
import { CreateColumnDto } from "./dto/create-column.dto";
import { UpdateColumnDto } from "./dto/update-column.dto";

@ApiTags("Columns")
@Controller("columns")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"), RolesGuard)
@Roles(...Object.values(Role))
export class ColumnController {
  constructor(private readonly columnService: ColumnService) {}

  private extractToken(authHeader: string): string {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("Authorization token missing or malformed");
    }
    return authHeader.split(" ")[1];
  }

  @Post()
  @ApiOperation({ summary: "Create a new column" })
  @ApiResponse({ status: 201, description: "Column created successfully." })
  async create(@Body() dto: CreateColumnDto, @Headers("authorization") authHeader: string) {
    const token = this.extractToken(authHeader);
    return this.columnService.create(dto, token);
  }

  @Get()
  @ApiOperation({ summary: "Get all columns" })
  async findAll(@Headers("authorization") authHeader: string) {
    const token = this.extractToken(authHeader);
    return this.columnService.findAll(token);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single column by ID" })
  async findOne(@Param("id") id: string, @Headers("authorization") authHeader: string) {
    const token = this.extractToken(authHeader);
    return this.columnService.findOne(id, token);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a column" })
  async remove(@Param("id") id: string, @Headers("authorization") authHeader: string) {
    const token = this.extractToken(authHeader);
    return this.columnService.remove(id, token);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a column" })
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateColumnDto,
    @Headers("authorization") authHeader: string
  ) {
    const token = this.extractToken(authHeader);
    return this.columnService.update(id, dto, token);
  }
}
