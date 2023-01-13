import { NFTStatus } from "@prisma/client";
import { NFTModel } from "./nft.model";

export class CreateNFTDto
{
    name: string;
    image: string;
    price: number;
    ownerId: number;

    static toModel(dto : CreateNFTDto) : NFTModel {

        if (!dto)
            return null;
        var r = new NFTModel();

        r.name = dto.name;
        r.image = dto.image;
        r.price = dto.price;
        r.ownerId = dto.ownerId;

        return r;
    }
}

export class UpdateNFTDto
{
    name: string;
    image: string;
    price: number;
    ownerId: number;
    status: NFTStatus;
    previousOwnersId: number[];

    static toModel(dto : UpdateNFTDto) : NFTModel {

        if (!dto)
            return null;
        var r = new NFTModel();

        r.name = dto.name;
        r.image = dto.image;
        r.price = dto.price;
        r.ownerId = dto.ownerId;
        r.status = dto.status;
        r.previousOwnersId = dto.previousOwnersId;

        return r;
    }
}

export class NFTDto
{
    id: number;
    status: NFTStatus;
    name: string;
    image: string;
    price: number;
    ownerId: number;
    collectionId: number;
    previousOwnersId: number[];

    static toModel(dto : NFTDto) : NFTModel {

        if (!dto)
            return null;

        var r = new NFTModel();

        r.name = dto.name;
        r.status = dto.status;
        r.image = dto.image;
        r.price = dto.price;
        r.ownerId = dto.ownerId;
        r.collectionId = dto.collectionId;
        r.previousOwnersId = dto.previousOwnersId;

        return r;
    }
}