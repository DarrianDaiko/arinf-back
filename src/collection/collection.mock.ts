import { HttpException } from "@nestjs/common";
import { NFTStatus } from "@prisma/client";
import { NFTDto } from "../nft/nft.dto";
import { CollectionModel } from "./collection.model";

export const mockCollectionRep = {
    collectionArray: [],
    index: 0,

    getLength: jest.fn().mockImplementation(() => {
        return mockCollectionRep.collectionArray.length;
    }),

    pushCollection: jest.fn().mockImplementation((collection) => {
        mockCollectionRep.collectionArray.push(collection);
    }),

    createCollection: jest.fn().mockImplementation(collectionData => {
        var mod = collectionData as CollectionModel;

        if (!mod.name || !mod.logo || mod.creatorId == null || !mod.status)
            throw new HttpException('Missing data', 400);

        let collection = {
            id: mockCollectionRep.index++,
            name: mod.name,
            logo: mod.logo,
            creatorId: mod.creatorId,
            status: mod.status,
            nftsId: mod.nftsIds,
            deletedAt: null
        }

        mockCollectionRep.collectionArray.push(collection);

        return collection;

    }),

    updateCollection: jest.fn().mockImplementation((id: number, collectionData) => {
        let elt = mockCollectionRep.collectionArray.find((nft) => nft.id === id);
        if (!elt)
            throw new HttpException('NFT not found', 404);
        if (!collectionData)
            return elt;
        elt.name = collectionData.name ? collectionData.name : elt.name;
        elt.logo = collectionData.logo ? collectionData.logo : elt.logo;
        elt.creatorId = collectionData.creatorId ? collectionData.creatorId : elt.creatorId;
        elt.status = collectionData.status ? collectionData.status : elt.status;
        elt.nftsId = collectionData.nftsId ? collectionData.nftsId : elt.nftsId;

        return elt;
    }),

    removeCollection: jest.fn().mockImplementation((id: number) => {
        let elt = mockCollectionRep.collectionArray.find((collection) => collection.id === id);
        if (!elt)
            return null;

        elt.deletedAt = new Date(Date.now());

        mockCollectionRep.collectionArray = mockCollectionRep.collectionArray.filter((collection) => collection.id !== id);

        return elt;
    }),

    addNFTToCollection: jest.fn().mockImplementation((collectionId: number, nftId: number) => {

        let collection = mockCollectionRep.collectionArray.find((collection) => collection.id === collectionId);
        if (!collection)
            return null;
        if (collection.nftsId.find((id) => id === nftId))
            return null;
        collection.nftsId.push(nftId);

        return collection;
    }),

    getCollection: jest.fn().mockImplementation((id: number) => {
        let elt = mockCollectionRep.collectionArray.find((collection) => collection.id === id);
        if (!elt)
            return null;

        return elt;
    }),

    getPublishedCollection: jest.fn().mockImplementation((id: number) => {
        let elt = mockCollectionRep.collectionArray
                .find((collection) => collection.id === id 
                    && collection.status == NFTStatus.PUBLISHED);
        if (!elt)
            return null;

        return elt;
    }),

    getCollections: jest.fn().mockImplementation((offset, limit) => {
        limit = limit ? limit : 100000000;
        return mockCollectionRep.collectionArray.slice(offset, offset + limit);
    }),
    getPublishedCollections: jest.fn().mockImplementation((offset, limit) => {
        limit = limit ? limit : 100000000;
        return mockCollectionRep.collectionArray
                .filter((collection) => collection.status == NFTStatus.PUBLISHED)
                .slice(offset, offset + limit);
    }),
}