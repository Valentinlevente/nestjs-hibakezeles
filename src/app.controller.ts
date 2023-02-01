import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Render } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppService } from './app.service';
import { RegisterDto } from './register.dto';
import { changeUserDto } from './changeUser.dto';
import User from './user.entity';
import * as bcrypt from 'bcrypt';
import { isBuffer } from 'util';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private dataSource: DataSource,
  ) {}

  @Get()
  @Render('index')
  index() {
    return { message: 'Welcome to the homepage' };
  }

  @Post('/register')
  async register(@Body() registerDto: RegisterDto) {
    if (!registerDto.email.includes('@')) {
      throw new BadRequestException('Email must contain a @ character');
    }
    if (registerDto.password !== registerDto.passwordAgain) {
      throw new BadRequestException('The two passwords dont match');
    }
    if (registerDto.password.length < 8) {
      throw new BadRequestException(
        'The password must be atleast 8 characters',
      );
    }

    const userRepo = this.dataSource.getRepository(User);
    const user = new User();
    user.email = registerDto.email;
    user.password = await bcrypt.hash(registerDto.password, 15);
    await userRepo.save(user);
  }

  @Patch('/users/:id')
  async editUser(
    @Param('id') id: number,
    @Body() changeUserDto: changeUserDto,
  ) {
    if (!changeUserDto.email.includes('@')) {
      throw new BadRequestException('Email must contain @ caracter');
    }
    if (
      changeUserDto.profilePictureUrl == null ||
      (!changeUserDto.profilePictureUrl.startsWith('https://') &&
      !changeUserDto.profilePictureUrl.startsWith('http://'))
    ) {
      throw new BadRequestException(
        'You must give an url for the profile picture',
      );
    }

    const userRepo = this.dataSource.getRepository(User);
    const user = await userRepo.findOneBy({ id: id });
    user.email = changeUserDto.email;
    if (changeUserDto.profilePictureUrl != null) {
      user.profilePictureUrl = changeUserDto.profilePictureUrl;
    }
    await userRepo.save(user);

    return 'Siker';
  }
}
