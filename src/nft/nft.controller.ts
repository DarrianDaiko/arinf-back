import { Controller, Get, Query, Post, Body, Put, Delete, Param, ParseIntPipe, Req, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateNFTDto, NFTDto, UpdateNFTDto } from './nft.dto';
import { NftService } from './nft.service';

const DEFAULT_PAGE: number = 0;
const DEFAULT_LIMIT: number = 10;


@ApiTags('nft')
@Controller('nft')
export class NftController {
    constructor(private readonly nftService: NftService) { }

    // Get a NFT using id
    @ApiBearerAuth()
    @ApiOperation({ summary: 'get specific NFT by id' })
    @ApiResponse({ status: 200, description: 'Return NFT', type: [NFTDto] })
    @ApiResponse({ status: 400, description: 'Provided informations incorrect' })
    @ApiResponse({ status: 404, description: 'No team found' })
    @ApiParam({ name: 'nft_id', required: true, type: 'integer' })
    @Get(':nft_id')
    async getNFT(@Req() req : any, @Param('nft_id', ParseIntPipe) id: number): Promise<NFTDto> {

        let user_id = req.user.userId ? req.user.userId : null;
        var r = await this.nftService.getNFT(user_id, id)

        return r.toDto();
    }

    // Get all non deleted NFTs with pagination
    @ApiBearerAuth()
    @ApiQuery({
        name: 'limit', required: false,
        schema: { type: 'integer', default: DEFAULT_LIMIT, minimum: 0, }
    })
    @ApiQuery({
        name: 'offset', required: false,
        schema: { type: 'integer', default: DEFAULT_PAGE, minimum: 0, }
    })
    @ApiOperation({ summary: 'Get all nfts' })
    @ApiResponse({ status: 200, description: 'Get a list of all nft whose deletedAt is null', type: [NFTDto] })
    @Get('')
    async getNFTs(@Req() req : any, @Query('limit', ParseIntPipe) limit?: number,
        @Query('offset', ParseIntPipe) offset?: number) {

        let user_id = req.user.userId ? req.user.userId : null;
        return await this.nftService.getNFTs(user_id, offset || DEFAULT_PAGE, limit || DEFAULT_LIMIT);
    }

    // Create a new NFT
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new NFT' })
    @ApiResponse({ status: 200, description: 'Created a brand new NFT', type: [NFTDto] })
    @ApiResponse({ status: 400, description: 'Provided informations incorrect' })
    @ApiBody({ type: CreateNFTDto })
    @ApiQuery({
        name: 'creator_id', required: true,
        schema: { type: 'integer', minimum: 0, }
    })
    @Post()
    async createNFT(@Req() req : any, @Body() create: CreateNFTDto): Promise<NFTDto> {
        let creatorId = req.user.userId;
        if (!creatorId)
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        
        var model = CreateNFTDto.toModel(create);
        var r = await this.nftService.createNFT(creatorId, model);

        return r.toDto();
    }

    // Update a NFT
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update NFT data' })
    @ApiResponse({ status: 200, description: 'NFT has been updated', type: [NFTDto] })
    @ApiResponse({ status: 400, description: 'Provided informations incorrect' })
    @ApiResponse({ status: 404, description: 'No NFT found' })
    @ApiBody({ type: UpdateNFTDto })
    @Put('')
    async updateNFT(id: number, @Body() update: UpdateNFTDto, @Req() req : any): Promise<NFTDto> {
        let user_id = req.user.userId ? req.user.userId : null;
        var model = UpdateNFTDto.toModel(update);
        var r = await this.nftService.updateNFT(user_id, id, model)

        return r.toDto();
    }

    // Delete a NFT, not really delete but set deletedAt to now
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete NFT' })
    @ApiResponse({ status: 200, description: 'NFT has been deleted', type: [NFTDto] })
    @ApiResponse({ status: 400, description: 'Provided informations incorrect' })
    @ApiResponse({ status: 404, description: 'No NFT found' })
    @ApiParam({ name: 'nft_id', required: true, type: 'integer' })
    @Delete(':nft_id')
    async deleteNFT(@Req() req : any, @Param('delete_nft_id', ParseIntPipe) id: number): Promise<NFTDto> {
        let user_id = req.user.userId;
        if (!user_id)
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        var r = await this.nftService.deleteNFT(user_id, id)

        return r.toDto();
    }
}
