import { Controller, Get, Patch, Body } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getCurrentUser() {
    return this.usersService.getCurrentUser();
  }

  @Patch()
  updateCurrentUser(@Body() updateUserDto: { name?: string }) {
    return this.usersService.updateCurrentUser(updateUserDto);
  }
}
