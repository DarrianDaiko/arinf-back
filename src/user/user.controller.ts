import { Controller, Get, Query, Post, Body, Put, Delete, Param, ParseIntPipe, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateUserDto, UpdateUserDto, UserDto } from './user.dto';
import { UserService } from './user.service';

const DEFAULT_PAGE: number = 0;
const DEFAULT_LIMIT: number = 10;

@ApiTags('user')
@Controller('user')
export class UserController {

    constructor(private readonly userService: UserService) { }

    // get self user
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'get self user' })
    @ApiResponse({ status: 200, description: 'Return user', type: [UserDto] })
    @ApiResponse({ status: 400, description: 'Provided informations incorrect' })
    @ApiResponse({ status: 404, description: 'No user found' })
    @Get('self')
    async getSelfUser(@Req() req: any): Promise<UserDto> {

        let id = req.user.userId;
        if (!id) {
            throw new HttpException("No user id found", HttpStatus.NOT_FOUND);
        }
        return this.userService.getUser(id, id);
    }

    // Get a user using id
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'get specific user by id' })
    @ApiResponse({ status: 200, description: 'Return user', type: [UserDto] })
    @ApiResponse({ status: 400, description: 'Provided informations incorrect' })
    @ApiResponse({ status: 404, description: 'No user found' })
    @ApiParam({ name: 'user_id', required: true, type: 'integer' })
    @Get(':user_id')
    async getUser(@Req() req : any, @Param('user_id', ParseIntPipe) id: number): Promise<UserDto> {

        let requesterId = req.user.userId;
        if (requesterId != id) {
            throw new Error("You can only get your own user, prefer to use /user/self");
        }

        var r = await this.userService.getUser(requesterId, id)

        return r.toDto();
    }

    // Get all non deleted users with pagination
    @ApiQuery({
        name: 'limit', required: false,
        schema: { type: 'integer', default: DEFAULT_LIMIT, minimum: 0, }
    })
    @ApiQuery({
        name: 'offset', required: false,
        schema: { type: 'integer', default: DEFAULT_PAGE, minimum: 0, }
    })
    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({ status: 200, description: 'Get a list of all users whose deletedAt is null', type: [UserDto] })
    @Get('')
    async getUsers(@Query('limit', ParseIntPipe) limit?: number, @Query('offset', ParseIntPipe) offset?: number): Promise<UserDto[]> {
        let r = await this.userService.getUsers(offset || DEFAULT_PAGE, limit || DEFAULT_LIMIT);
        return r.map(x => x.toDto());
    }

    @ApiOperation({ summary: 'Create a new user' })
    @ApiResponse({ status: 200, description: 'Created a brand new user', type: [UserDto] })
    @ApiResponse({ status: 400, description: 'Provided informations incorrect' })
    @ApiBody({ type: CreateUserDto })
    @Post('')
    // Create a new user using CreateUserDto
    async createUser(@Body() create: CreateUserDto): Promise<UserDto> {

        var model = CreateUserDto.toModel(create);
        var r = await this.userService.createUser(model)

        return r.toDto();
    }

    // Update a user using UpdateUserDto
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Update data user' })
    @ApiResponse({ status: 200, description: 'User has been updated', type: [UserDto] })
    @ApiResponse({ status: 400, description: 'Provided informations incorrect' })
    @ApiResponse({ status: 404, description: 'No user found' })
    @ApiBody({ type: UpdateUserDto })
    @ApiParam({ name: 'user_id', required: true, type: 'integer' })
    @Put(':user_id')
    async updateUser(@Req() req : any, @Param('user_id', ParseIntPipe) id: number, @Body() update: UpdateUserDto): Promise<UserDto> {

        let requesterId = req.user.userId;
        if (!requesterId) {
            throw new HttpException("You can only update your own user", HttpStatus.FORBIDDEN);
        }
        var model = UpdateUserDto.toModel(update);
        var r = await this.userService.updateUser(requesterId, id, model)

        return r.toDto();
    }

    // Delete a user using id
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Delete user' })
    @ApiResponse({ status: 200, description: 'User has been deleted', type: [UserDto] })
    @ApiResponse({ status: 400, description: 'Provided informations incorrect' })
    @ApiResponse({ status: 404, description: 'No user found' })
    @ApiParam({ name: 'user_id', required: true, type: 'integer' })
    @Delete(':user_id')
    async deleteUser(@Req() req : any, @Param('user_id', ParseIntPipe) id: number): Promise<UserDto> {

        let requesterId = req.user.userId;
        if (!requesterId) {
            throw new HttpException("You can only delete your own user", HttpStatus.FORBIDDEN);
        }

        var r = await this.userService.deleteUser(requesterId, id)

        return r.toDto();
    }

}
