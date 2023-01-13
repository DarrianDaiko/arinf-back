import { SellModel } from "./sell.model";

export class CreateSellDTO {
    nftId: number;
    price: number;
    sellerId: number;
    buyerId: number;

    static toModel(dto: CreateSellDTO): SellModel {
        if (!dto)
            return null;

        return {
            nftId: dto.nftId,
            price: dto.price,
            sellerId: dto.sellerId,
            buyerId: dto.buyerId
        }
    }
}

export class SellDTO {
    id: number;
    nftId: number;
    price: number;
    sellerId: number;
    buyerId: number;

    static toModel(dto: SellDTO): SellModel {
        if (!dto)
            return null;
        return {
            id: dto.id,
            nftId: dto.nftId,
            price: dto.price,
            sellerId: dto.sellerId,
            buyerId: dto.buyerId
        }
    }
}