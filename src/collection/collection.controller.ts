import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, Req, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CollectionDto, CreateCollectionDto, UpdateCollectionDto } from './collection.dto';
import { CollectionWithPriceModel } from './collection.model';
import { CollectionService } from './collection.service';

const DEFAULT_PAGE: number = 0;
const DEFAULT_LIMIT: number = 10;

@ApiTags('collection')
@Controller('collection')
export class CollectionController {

    constructor(private readonly service: CollectionService) { }

    //Get top collections with pagination
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get most sold collections' })
    @ApiResponse({ status: 200, description: 'Return top collections', type: [CollectionWithPriceModel] })
    @ApiResponse({ status: 400, description: 'Provided informations incorrect' })
    @ApiQuery({
        name: 'limit', required: false,
        schema: { type: 'integer', default: DEFAULT_LIMIT, minimum: 0, }
    })
    @ApiQuery({
        name: 'offset', required: false,
        schema: { type: 'integer', default: DEFAULT_PAGE, minimum: 0, }
    })
    @Get('top')
    async getTopCollections(@Req() req : any, @Query('limit', ParseIntPipe) limit?: number,
        @Query('offset', ParseIntPipe) offset?: number) {
        let id = req.user.userId;
        return await this.service.getTopCollections(id, offset || DEFAULT_PAGE, limit || DEFAULT_LIMIT);
    }

    // Get all non deleted collections with pagination
    @ApiQuery({
        name: 'limit', required: false,
        schema: { type: 'integer', default: DEFAULT_LIMIT, minimum: 0, }
    })
    @ApiQuery({
        name: 'offset', required: false,
        schema: { type: 'integer', default: DEFAULT_PAGE, minimum: 0, }
    })
    @ApiOperation({ summary: 'Get all collections' })
    @ApiResponse({ status: 200, description: 'Get a list of all collections whose deletedAt is null', type: [CollectionDto] })
    @Get('')
    async getCollections(@Query('limit', ParseIntPipe) limit?: number,
        @Query('offset', ParseIntPipe) offset?: number) {
        return await this.service.getCollections(offset || DEFAULT_PAGE, limit || DEFAULT_LIMIT);
    }

    // Create a new collection
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new collection' })
    @ApiResponse({ status: 200, description: 'Created a brand new collection', type: [CollectionDto] })
    @ApiResponse({ status: 400, description: 'Provided informations incorrect' })
    @ApiBody({ type: CreateCollectionDto })
    @Post()
    async createCollection(@Body() create: CreateCollectionDto, @Req() req: any): Promise<CollectionDto> {
        let creatorId = req.user.userId;
        if (!creatorId) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        var model = CreateCollectionDto.toModel(create);
        var r = await this.service.createCollection(creatorId, model);

        return r.toDto();
    }

    // Update a collection
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update collection data' })
    @ApiResponse({ status: 200, description: 'collection has been updated', type: [CollectionDto] })
    @ApiResponse({ status: 400, description: 'Provided informations incorrect' })
    @ApiResponse({ status: 404, description: 'No collection found' })
    @ApiBody({ type: UpdateCollectionDto })
    @Put('')
    async updateCollection(id: number, @Body() update: UpdateCollectionDto,
        @Req() req: any): Promise<CollectionDto> {
        var user = req.user.userId;
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        var model = UpdateCollectionDto.toModel(update);
        var r = await this.service.updateCollection(user, id, model)

        return r.toDto();
    }

    // Delete a collection, not really delete but set deletedAt to now
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete collection' })
    @ApiResponse({ status: 200, description: 'collection has been deleted', type: [CollectionDto] })
    @ApiResponse({ status: 400, description: 'Provided informations incorrect' })
    @ApiResponse({ status: 404, description: 'No collection found' })
    @ApiParam({ name: 'collection_id', required: true, type: 'integer' })
    @Delete(':collection_id')
    async deleteCollection(@Req() req: any, @Param('delete_collection_id', ParseIntPipe) id: number): Promise<CollectionDto> {

        let user_id = req.user.userId;

        if (!user_id) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        var r = await this.service.deleteCollection(user_id, id)

        return r.toDto();
    }

    // Get a collection using id
    @ApiBearerAuth()
    @ApiOperation({ summary: 'get specific collection by id' })
    @ApiResponse({ status: 200, description: 'Return collection', type: [CollectionDto] })
    @ApiResponse({ status: 400, description: 'Provided informations incorrect' })
    @ApiResponse({ status: 404, description: 'No team found' })
    @ApiParam({ name: 'collection_id', required: true, type: 'integer' })
    @Get(':collection_id')
    async getCollection(@Req() req : any, @Param('collection_id', ParseIntPipe) id: number): Promise<CollectionDto> {
        let userId = req.user.userId;
        var r = await this.service.getCollection(userId, id)

        return r.toDto();
    }

}
