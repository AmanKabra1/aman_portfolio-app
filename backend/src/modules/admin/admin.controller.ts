import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Query,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard) // Require both auth and admin role
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Get system statistics
   */
  @Get('stats')
  getStatistics() {
    return this.adminService.getStatistics();
  }

  /**
   * Get all users
   */
  @Get('users')
  getAllUsers(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 20,
  ) {
    return this.adminService.getAllUsers(page, limit);
  }

  /**
   * Get user by ID
   */
  @Get('users/:id')
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getUserById(id);
  }

  /**
   * Update user
   */
  @Put('users/:id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateUserDto,
  ) {
    return this.adminService.updateUser(id, updateDto);
  }

  /**
   * Delete user
   */
  @Delete('users/:id')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteUser(id);
  }

  /**
   * Get all portfolios
   */
  @Get('portfolios')
  getAllPortfolios(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 20,
  ) {
    return this.adminService.getAllPortfolios(page, limit);
  }
}