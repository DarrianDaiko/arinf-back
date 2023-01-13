import { Collection, NFTStatus } from "@prisma/client";
import { CollectionDto } from "./collection.dto";

export class CollectionModel
{
    id: number;
    name: string;
    logo: string;
    status : NFTStatus;
    archivedAt: Date;
    nftsIds: number[];
    creatorId: number;
    // to Dto
    toDto() : CollectionDto
    {
        var dto = new CollectionDto();
        dto.id = this.id;
        dto.name = this.name;
        dto.creatorId = this.creatorId;
        dto.logo = this.logo;
        dto.status = this.status;
        dto.archivedAt = this.archivedAt;
        dto.nftsIds = this.nftsIds;

        return dto;
    }

    static fromEntity(entity : Collection) : CollectionModel
    {
        if (!entity)
            return null;
        var model = new CollectionModel();
        model.id = entity.id;
        model.name = entity.name;
        model.creatorId = entity.creatorId;
        model.logo = entity.logo;
        model.status = entity.status;
        model.archivedAt = entity.archivingDate;
        model.nftsIds = entity.nftsId;
        return model;

    }
    
}
export class CollectionWithPriceModel extends CollectionModel
{
    price: number;
    static fromEntity(entity : Collection) : CollectionWithPriceModel
    {
        if (!entity)
            return null;
        var model = new CollectionWithPriceModel();
        model.id = entity.id;
        model.name = entity.name;
        model.creatorId = entity.creatorId;
        model.logo = entity.logo;
        model.status = entity.status;
        model.archivedAt = entity.archivingDate;
        model.nftsIds = entity.nftsId;

        return model;
    }
}