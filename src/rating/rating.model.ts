import { Rating } from "@prisma/client";
import { RatingDTO } from "./rating.dto";

export class RatingModel
{
    id? : number;
    nftId : number;
    userId : number;
    rating : number;
    deletedAt? : Date;


    static toDTO(model : RatingModel) : RatingDTO {
        if (!model)
            return null;
        return {
            id : model.id,
            nftId : model.nftId,
            userId : model.userId,
            rating : model.rating,
            deletedAt : model.deletedAt

        }
    }

    static fromEntity(entity : Rating) : RatingModel {
        if (!entity)
            return null;
        return {
            id : entity.id,
            nftId : entity.nftId,
            userId : entity.userId,
            rating : entity.rating,
            deletedAt : entity.deletedAt
        }
    }
}