import { HttpException } from "@nestjs/common";
import { NFT, NFTStatus } from "@prisma/client";
import { NFTModel } from "./nft.model";

export const createNFT = (mockNFTRep: any, id: number, name: string, image: string,
    ownerId: number, price: number, collectionId: number,
    status: NFTStatus): NFT => {
    const nft = new NFTModel();
    nft.id = id;
    nft.name = name;
    nft.image = image;
    nft.ownerId = ownerId;
    nft.price = price;
    nft.collectionId = collectionId;
    nft.status = status;
    nft.previousOwnersId = [];

    return mockNFTRep.createNFT(nft);

};

export const mockNFTRep = {
    index: 0,
    nftArray: [],

    getLength: jest.fn().mockImplementation(() => {
        return mockNFTRep.nftArray.length;
    }),

    pushNFT: jest.fn().mockImplementation((nft) => {
        mockNFTRep.nftArray.push(nft);
    }),

    createNFT: jest.fn().mockImplementation(nftData => {
        var mod = nftData as NFTModel;

        if (!mod.name || !mod.image || mod.ownerId == null || mod.price == null || mod.status == null)
            throw new HttpException('Missing data', 400);

        let nft = {
            id: mockNFTRep.index++,
            name: mod.name,
            image: mod.image,
            ownerId: mod.ownerId,
            price: mod.price,
            collectionId: mod.collectionId,
            status: mod.status,
            deletedAt: null,
            previousOwnersId: []
        }

        mockNFTRep.nftArray.push(nft);

        return nft;

    }),
    updateNFT: jest.fn().mockImplementation((id: number, nftData) => {
        let elt = mockNFTRep.nftArray.find((nft) => nft.id === id);
        if (!elt)
            throw new HttpException('NFT not found', 404);
        if (!nftData)
            return elt;
        elt.name = nftData.name ? nftData.name : elt.name;
        elt.image = nftData.image ? nftData.image : elt.image;
        elt.ownerId = nftData.ownerId ? nftData.ownerId : elt.ownerId;
        elt.price = nftData.price ? nftData.price : elt.price;
        elt.status = nftData.status ? nftData.status : elt.status;
        elt.collectionId = nftData.collectionId ? nftData.collectionId : elt.collectionId;
        elt.previousOwnersId = nftData.previousOwnersId ? nftData.previousOwnersId : elt.previousOwnersId;

        return elt;
    }),
    removeNFT: jest.fn().mockImplementation((id: number) => {
        let elt = mockNFTRep.nftArray.find((nft) => nft.id == id);
        if (!elt)
            return null;
        elt.deletedAt = new Date();
        mockNFTRep.nftArray = mockNFTRep.nftArray.filter((nft) => nft.id !== id);
        return elt;
    }),
    getNFT: jest.fn().mockImplementation(
        (id: number) => {
            return mockNFTRep.nftArray.find((nft) => nft.id === id);
        }
    ),
    getNFTs: jest.fn().mockImplementation(
        (offset, limit) => {
            return mockNFTRep.nftArray.slice(offset, offset + limit);
        }
    ),
    
    getTopPublishedNFTs: jest.fn().mockImplementation(
        (offset, limit) => {
            var nfts = mockNFTRep.nftArray;
            nfts = nfts.filter((nft) => nft.status == NFTStatus.PUBLISHED);
            nfts = nfts.sort((a, b) => {
                return b.price - a.price;
            }
            );
            return nfts.slice(offset, offset + limit);
        }
    ),
    getPublishedNFT: jest.fn().mockImplementation(
        (id) => {
            var nfts = mockNFTRep.nftArray;
            nfts = nfts.filter((nft) => nft.id == id 
                    && nft.status == NFTStatus.PUBLISHED);
            return nfts;
        }
    ),
    isOwner: jest.fn().mockImplementation(
        (id: number, userId: number) => {
            let nfts = mockNFTRep.nftArray.find((nft) => nft.id == id && nft.ownerId == userId);
            return nfts != null;
        }
    ),
    getTopNFTs: jest.fn().mockImplementation(
        (offset, limit) => {
            var nfts = mockNFTRep.nftArray;
            nfts = nfts.sort((a, b) => {
                return b.price - a.price;
            }
            );
            return nfts.slice(offset, offset + limit);
        }
    ),

    getNFTsByCollectionId: jest.fn().mockImplementation(
        (collectionId: number, offset, limit) => {
            var nfts = mockNFTRep.nftArray;
            nfts = nfts.filter((nft) => nft.collectionId == collectionId);
            return nfts.slice(offset, offset + limit);
        }
    ),

    /*getMostRatedNFTs: jest.fn().mockImplementation(
        (offset, limit) => {
            var nfts = mockNFTRep.nftArray;
            nfts = nfts.sort((a, b) => {
                return b.rating - a.rating;
            }
            );
            return nfts.slice(offset, offset + limit);
        }
    ),*/
};