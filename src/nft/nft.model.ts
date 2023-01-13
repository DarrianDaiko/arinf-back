import { NFT, NFTStatus } from "@prisma/client";
import { NFTDto } from "./nft.dto";

export class NFTModel 
{
    id: number;
    name: string;
    image: string;
    price: number;
    ownerId: number;
    status : NFTStatus;
    collectionId: number;
    previousOwnersId: number[];
    // to Dto
    toDto() : NFTDto
    {
        var dto = new NFTDto();
        dto.id = this.id;
        dto.status = this.status;
        dto.name = this.name;
        dto.image = this.image;
        dto.price = this.price;
        dto.ownerId = this.ownerId;
        dto.collectionId = this.collectionId;
        dto.previousOwnersId = this.previousOwnersId;
        return dto;
    }

    static fromEntity(entity : NFT) : NFTModel
    {
        if (!entity)
            return null;
        var model = new NFTModel();
        model.id = entity.id;
        model.status = entity.status;
        model.name = entity.name;
        model.image = entity.image;
        model.price = entity.price;
        model.ownerId = entity.ownerId;
        model.collectionId = entity.collectionId;
        model.previousOwnersId = entity.previousOwnersId;
        return model;
    }
}

export class NFTWithRatingModel extends NFTModel
{
    rating : number;
    static fromEntity(entity : NFT) : NFTWithRatingModel
    {
        if (!entity)
            return null;
        var model = new NFTWithRatingModel();
        model.id = entity.id;
        model.status = entity.status;
        model.name = entity.name;
        model.image = entity.image;
        model.price = entity.price;
        model.ownerId = entity.ownerId;
        model.collectionId = entity.collectionId;
        model.previousOwnersId = entity.previousOwnersId;
        return model;
    }
}