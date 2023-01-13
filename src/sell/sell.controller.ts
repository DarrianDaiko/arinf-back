import { Controller, ParseIntPipe, Get, Post, Query, Req, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SellDTO } from './sell.dto';
import { SellService } from './sell.service';

const DEFAULT_PAGE: number = 0;
const DEFAULT_LIMIT: number = 10;

@ApiTags('sell')
@Controller('sell')
export class SellController {

    constructor(private readonly sellService: SellService) { }


    // Get last sells with pagination

    @ApiQuery({
        name: 'limit', required: false,
        schema: { type: 'integer', default: DEFAULT_LIMIT, minimum: 0, }
    })
    @ApiQuery({
        name: 'offset', required: false,
        schema: { type: 'integer', default: DEFAULT_PAGE, minimum: 0, }
    })
    @ApiOperation({ summary: 'Get all sells' })
    @ApiResponse({ status: 200, description: 'Get a list of all sells whose deletedAt is null', type: [SellDTO] })
    @Get('last')
    async getLastSells(@Query('limit', ParseIntPipe) limit?: number,
        @Query('offset', ParseIntPipe) offset?: number) {
        return await this.sellService.getLastSells(offset || DEFAULT_PAGE, limit || DEFAULT_LIMIT);
    }

    // Get own sells with pagination
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiQuery({
        name: 'limit', required: false,
        schema: { type: 'integer', default: DEFAULT_LIMIT, minimum: 0, }
    })
    @ApiQuery({
        name: 'offset', required: false,
        schema: { type: 'integer', default: DEFAULT_PAGE, minimum: 0, }
    })
    @ApiOperation({ summary: 'Get all own sells' })
    @ApiResponse({ status: 200, description: 'Get a list of all sells whose deletedAt is null', type: [SellDTO] })
    @Get('own')
    async getOwnSells(@Req() req: any,
        @Query('limit', ParseIntPipe) limit?: number,
        @Query('offset', ParseIntPipe) offset?: number) {
        const id = req.user.userId;

        if (!id) {
            throw new HttpException(`user ${id} not found`, HttpStatus.UNAUTHORIZED)
        }
        return await this.sellService.getOwnSells(id, offset || DEFAULT_PAGE, limit || DEFAULT_LIMIT);
    }

    // Get all non deleted Sells with pagination

    @ApiQuery({
        name: 'limit', required: false,
        schema: { type: 'integer', default: DEFAULT_LIMIT, minimum: 0, }
    })
    @ApiQuery({
        name: 'offset', required: false,
        schema: { type: 'integer', default: DEFAULT_PAGE, minimum: 0, }
    })
    @ApiOperation({ summary: 'Get all sells' })
    @ApiResponse({ status: 200, description: 'Get a list of all sells whose deletedAt is null', type: [SellDTO] })
    @Get('')
    async getSells(@Query('limit', ParseIntPipe) limit?: number,
        @Query('offset', ParseIntPipe) offset?: number) {
        return await this.sellService.getSells(offset || DEFAULT_PAGE, limit || DEFAULT_LIMIT);
    }

    // Get a sell by id
    @ApiOperation({ summary: 'Get a sell by id' })
    @ApiResponse({ status: 200, description: 'Get a sell by id', type: [SellDTO] })
    @ApiResponse({ status: 404, description: 'No sell found' })
    @Get(':id')
    async getSellById(@Query('id', ParseIntPipe) id: number) {
        return await this.sellService.getSell(id);
    }

}
