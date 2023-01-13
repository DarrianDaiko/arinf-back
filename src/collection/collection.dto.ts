import { NFTStatus } from "@prisma/client";
import { CollectionModel } from "./collection.model";

export class CreateCollectionDto
{
    name: string;
    logo: string;
    status : NFTStatus;
    creatorId: number;
    nftsIds: number[];

    static toModel(dto : CreateCollectionDto) : CollectionModel
    {
        if (!dto)
            return null;
        var model = new CollectionModel();
        model.name = dto.name;
        model.creatorId = dto.creatorId;
        model.logo = dto.logo;
        model.status = dto.status;
        model.nftsIds = dto.nftsIds;
        
        return model;
    }
}

export class UpdateCollectionDto
{
    name: string;
    logo: string;
    status : NFTStatus;
    archivedAt: Date;
    nftsIds: number[];
    creatorId: number;

    static toModel(dto : UpdateCollectionDto) : CollectionModel
    {
        if (!dto)
            return null;
        var model = new CollectionModel();
        model.name = dto.name;
        model.creatorId = dto.creatorId;
        model.logo = dto.logo;
        model.status = dto.status;
        model.archivedAt = dto.archivedAt;
        model.nftsIds = dto.nftsIds;
        
        return model;
    }
}

export class CollectionDto
{
    id: number;
    name: string;
    logo: string;
    status : NFTStatus;
    archivedAt: Date;
    nftsIds: number[];
    creatorId: number;

    static toModel(dto : CollectionDto) : CollectionModel
    {
        var model = new CollectionModel();
        model.id = dto.id;
        model.name = dto.name;
        model.creatorId = dto.creatorId;
        model.logo = dto.logo;
        model.status = dto.status;
        model.archivedAt = dto.archivedAt;
        model.nftsIds = dto.nftsIds;
        
        return model;
    }
}
