import { Controller, Delete, Get, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Body } from '@nestjs/common/decorators';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NFTModel, NFTWithRatingModel } from '../nft/nft.model';
import { RatingDTO } from './rating.dto';
import { RatingService } from './rating.service';


const DEFAULT_PAGE: number = 0;
const DEFAULT_LIMIT: number = 10;

@ApiTags('rating')
@Controller('rating')
export class RatingController {
    constructor(private readonly ratingService: RatingService) {
    }

    // Get most rated nfts

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get most rated nfts' })
    @ApiResponse({ status: 200, description: 'Get most rated nfts', type: [NFTWithRatingModel] })
    @ApiQuery({
        name: 'limit', required: false,
        schema: { type: 'integer', default: DEFAULT_LIMIT, minimum: 0, }
    })
    @ApiQuery({
        name: 'offset', required: false,
        schema: { type: 'integer', default: DEFAULT_PAGE, minimum: 0, }
    })
    @Get('most_rated')
    async getMostRatedNfts(@Req() req : any, @Query('limit', ParseIntPipe) limit?: number,
        @Query('offset', ParseIntPipe) offset?: number) : Promise<NFTWithRatingModel[]> {
            let userId = req.user.userId;
            return await this.ratingService.getTopRatings(userId, offset || DEFAULT_PAGE, limit || DEFAULT_LIMIT);
    }


    // Get all ratings with pagination

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
    @ApiOperation({ summary: 'Get all ratings' })
    @ApiResponse({ status: 200, description: 'Get a list of all ratings whose deletedAt is null', type: [RatingDTO] })
    @Get('')
    async getAllRatings(@Query('limit', ParseIntPipe) limit?: number,
        @Query('offset', ParseIntPipe) offset?: number) {

        return await this.ratingService.getRatings(offset || DEFAULT_PAGE, limit || DEFAULT_LIMIT);
    }

    // Get rating by id

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get rating by id' })
    @ApiResponse({ status: 200, description: 'Get a rating by id', type: RatingDTO })
    @ApiQuery({
        name: 'id', required: true,
        schema: { type: 'integer', minimum: 0, }
    })
    @Get(':id')
    async getRatingById(@Query('id', ParseIntPipe) id: number) {
        return await this.ratingService.getRating(id);
    }

    // Create rating

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create rating' })
    @ApiResponse({ status: 200, description: 'Create a rating', type: RatingDTO })
    @ApiBody({ type: RatingDTO })
    @Post('')
    async createRating(@Req() req: any, @Body() dto: RatingDTO) {
        const id = req.user.userId;

        return await this.ratingService.createRating(id, dto);
    }

    // Update rating

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update rating' })
    @ApiResponse({ status: 200, description: 'Update a rating', type: RatingDTO })
    @ApiBody({ type: RatingDTO })
    @ApiQuery({
        name: 'id', required: true,
        schema: { type: 'integer', minimum: 0, }
    })
    @Post(':id')
    async updateRating(@Query('id', ParseIntPipe) id: number, @Body() dto: RatingDTO) {

        return await this.ratingService.updateRating(id, dto);
    }

    // Delete rating

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete rating' })
    @ApiResponse({ status: 200, description: 'Delete a rating', type: RatingDTO })
    @ApiQuery({
        name: 'id', required: true,
        schema: { type: 'integer', minimum: 0, }
    })
    @Delete(':id')
    async deleteRating(@Query('id', ParseIntPipe) id: number) {

        return await this.ratingService.deleteRating(id);
    }
}