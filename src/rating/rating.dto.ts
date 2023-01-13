import { RatingModel } from "./rating.model";

export class RatingDTO
{
    id? : number;
    nftId : number;
    userId : number;
    rating : number;
    deletedAt? : Date;

    static toModel(dto : RatingDTO) : RatingModel {
        if (!dto)
            return null;
        return {
            id : dto.id,
            nftId : dto.nftId,
            userId : dto.userId,
            rating : dto.rating,
        }
    }
}