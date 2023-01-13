import { HttpException } from "@nestjs/common";
import { SellModel } from "./sell.model";

export const mockSellRep = {
    sellArray: [],
    index: 0,

    getLength: jest.fn().mockImplementation(() => {
        return mockSellRep.sellArray.length;
    }),

    pushSell: jest.fn().mockImplementation((team) => {
        mockSellRep.sellArray.push(team);
    }),

    createSell: jest.fn().mockImplementation(sellData => {
        var mod = sellData as SellModel;

        if (mod.nftId == null || mod.price == null 
            || mod.sellerId == null || mod.buyerId == null)
            throw new HttpException('Missing data', 400);

        let sell = {
            id: mockSellRep.index++,
            nftId: mod.nftId,
            price: mod.price,
            buyerId: mod.buyerId,
            sellerId: mod.sellerId,
            deletedAt: null,
            createdAt: new Date(Date.now())
        }

        mockSellRep.sellArray.push(sell);

        return sell;

    }),

    updateSell: jest.fn().mockImplementation((id: number, sellData) => {
        let elt = mockSellRep.sellArray.find((sell) => sell.id === id);
        if (!elt)
            return null;

        let mod = sellData as SellModel;

        if (mod.nftId)
            elt.nftId = mod.nftId;
        if (mod.price)
            elt.price = mod.price;
        if (mod.buyerId)
            elt.buyerId = mod.buyerId;
        if (mod.sellerId)
            elt.sellerId = mod.sellerId;

        return elt;
    }),

    removeSell: jest.fn().mockImplementation((id: number) => {
        let elt = mockSellRep.sellArray.find((sell) => sell.id === id);
        if (!elt)
            return null;

        elt.deletedAt = new Date();

        return elt;
    }),

    getSell: jest.fn().mockImplementation((id: number) => {
        let elt = mockSellRep.sellArray.find((sell) => sell.id === id);
        if (!elt)
            return null;

        return elt;
    }),

    getSells: jest.fn().mockImplementation((offset, limit) => {

        let sells = mockSellRep.sellArray
        let result = sells.slice(offset, offset + limit);

        return result;
    }),

    getSellsByUserId: jest.fn().mockImplementation((userId: number, offset, limit) => {

        let sells = mockSellRep.sellArray.filter((sell) => (sell.sellerId === userId || sell.sellerId === userId));
        let result = sells.slice(offset, offset + limit);

        return result;
    }),

    getBuysByUserId: jest.fn().mockImplementation((userId: number, offset, limit) => {

        let sells = mockSellRep.sellArray.filter((sell) => (sell.buyerId === userId || sell.buyerId === userId));
        let result = sells.slice(offset, offset + limit);

        return result;
    }),
    getLastSells: jest.fn().mockImplementation((offset, limit) => {

        let sells = mockSellRep.sellArray;

        //sort by most recent first
        sells.sort((a, b) => {
            return b.createdAt.getTime() - a.createdAt.getTime();
        });

        let result = sells.slice(offset, offset + limit);

        return result;
    }),

};