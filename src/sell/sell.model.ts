import { Sell } from "@prisma/client";
import { SellDTO } from "./sell.dto";

export class SellModel
{
    id? : number;
    nftId : number;
    price : number;
    sellerId : number;
    buyerId : number;
    createdAt? : Date;

    static toDTO(model : SellModel) : SellDTO {
        if (!model)
            return null;
        return {
            id : model.id,
            nftId : model.nftId,
            price : model.price,
            sellerId : model.sellerId,
            buyerId : model.buyerId
        }
    }

    static toEntity(model : SellModel) : Sell {
        if (!model)
            return null;
        return {
            id : model.id,
            nftId : model.nftId,
            price : model.price,
            sellerId : model.sellerId,
            buyerId : model.buyerId,
            createdAt : model.createdAt
        }
    }

    static fromEntity(model : Sell) : SellModel {
        if (!model)
            return null;
        return {
            id : model.id,
            nftId : model.nftId,
            price : model.price,
            sellerId : model.sellerId,
            buyerId : model.buyerId,
            createdAt : model.createdAt
        }
    }
}