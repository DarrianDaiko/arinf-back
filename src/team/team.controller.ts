import { Controller, Get, Query, Post, Body, Put, Delete, Param, ParseIntPipe, UseGuards, HttpException, Req, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTeamDto, TeamDto, UpdateTeamDto } from './team.dto';
import { TeamService } from './team.service';

const DEFAULT_PAGE: number = 0;
const DEFAULT_LIMIT: number = 10;

@ApiTags('team')
@Controller('team')
export class TeamController {

    constructor(private readonly teamService: TeamService) { }
    // Get best selling teams with pagination
    @ApiOperation({ summary: 'Get best selling teams' })
    @ApiResponse({ status: 200, description: 'Return best selling teams', type: [TeamDto] })
    @ApiResponse({ status: 400, description: 'Provided informations incorrect' })
    @ApiQuery({
        name: 'limit', required: false,
        schema: { type: 'integer', default: DEFAULT_LIMIT, minimum: 0, }
    })
    @ApiQuery({
        name: 'offset', required: false,
        schema: { type: 'integer', default: DEFAULT_PAGE, minimum: 0, }
    })
    @Get('best_selling')
    async getBestSellingTeams(@Query('limit', ParseIntPipe) limit?: number, @Query('offset', ParseIntPipe) offset?: number) {
        return await this.teamService.getTeamsWithMostSells(offset || DEFAULT_PAGE, limit || DEFAULT_LIMIT);
    }

    // Get a team using id
    @ApiOperation({ summary: 'get specific team by id' })
    @ApiResponse({ status: 200, description: 'Return team', type: [TeamDto] })
    @ApiResponse({ status: 400, description: 'Provided informations incorrect' })
    @ApiResponse({ status: 404, description: 'No team found' })
    @ApiParam({ name: 'team_id', required: true, type: 'integer' })
    @Get(':team_id')
    async getTeam(@Param('team_id', ParseIntPipe) id: number): Promise<TeamDto> {
        var r = await this.teamService.getTeam(id)

        return r.toDto();
    }


    // Get all non deleted teams with pagination
    @ApiQuery({
        name: 'limit', required: false,
        schema: { type: 'integer', default: DEFAULT_LIMIT, minimum: 0, }
    })
    @ApiQuery({
        name: 'offset', required: false,
        schema: { type: 'integer', default: DEFAULT_PAGE, minimum: 0, }
    })
    @ApiOperation({ summary: 'Get all teams' })
    @ApiResponse({ status: 200, description: 'Get a list of all teams whose deletedAt is null', type: [TeamDto] })
    @Get('')
    async getTeams(@Query('limit', ParseIntPipe) limit?: number, @Query('offset', ParseIntPipe) offset?: number) {
        return await this.teamService.getTeams(offset || DEFAULT_PAGE, limit || DEFAULT_LIMIT);
    }

    // Create a new team
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new team' })
    @ApiResponse({ status: 200, description: 'Created a brand new team', type: [TeamDto] })
    @ApiResponse({ status: 400, description: 'Provided informations incorrect' })
    @ApiBody({ type: CreateTeamDto })
    @Post()
    async createTeam(@Body() create: CreateTeamDto, @Req() req : any): Promise<TeamDto> {
        let creatorId = req.user.userId;
        if (!creatorId) {
            throw new HttpException('User id not provided', HttpStatus.BAD_REQUEST);
        }
        var model = CreateTeamDto.toModel(create);
        var r = await this.teamService.createTeam(creatorId, model);

        return r.toDto();
    }

    // Update a team
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update team data' })
    @ApiResponse({ status: 200, description: 'Team has been updated', type: [TeamDto] })
    @ApiResponse({ status: 400, description: 'Provided informations incorrect' })
    @ApiResponse({ status: 404, description: 'No team found' })
    @ApiBody({ type: UpdateTeamDto })
    @Put('')
    async updateTeam(@Req() req : any, id: number, @Body() update: UpdateTeamDto): Promise<TeamDto> {
        let userId = req.user.userId;
        if (!userId) {
            throw new HttpException('User id not provided', HttpStatus.BAD_REQUEST);
        }
        var model = UpdateTeamDto.toModel(update);
        var r = await this.teamService.updadeTeam(userId, id, model)

        return r.toDto();
    }

    // Delete a team
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete team' })
    @ApiResponse({ status: 200, description: 'Team has been deleted', type: [TeamDto] })
    @ApiResponse({ status: 400, description: 'Provided informations incorrect' })
    @ApiResponse({ status: 404, description: 'No team found' })
    @ApiParam({ name: 'team_id', required: true, type: 'integer' })
    @Delete(':team_id')
    async deleteTeam(@Req() req : any, @Param('team_id', ParseIntPipe) id: number): Promise<TeamDto> {

        let userId = req.user.userId;
        if (!userId) {
            throw new HttpException('User id not provided', HttpStatus.BAD_REQUEST);
        }
        var r = await this.teamService.deleteTeam(userId, id)

        return r.toDto();
    }

}
