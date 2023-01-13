import { HttpException } from "@nestjs/common/exceptions/http.exception";
import { connect } from "http2";
import { RatingModel } from "./rating.model";

var groupBy = function(xs, key) {
    return xs.reduce(function(rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };
  

export const mockRatingRep = {
    index: 0,
    ratingArray: [],

    getLength: jest.fn().mockImplementation(() => {
        return mockRatingRep.ratingArray.length;
    }),
    pushRating: jest.fn().mockImplementation((rating) => {
        mockRatingRep.ratingArray.push(rating);
    }),

    createRating: jest.fn().mockImplementation((ratingData) => {
        var mod = ratingData as RatingModel;

        if (mod.nftId == null || mod.userId == null || mod.rating == null)
            throw new HttpException('Missing data', 400);

        let rating = {
            id: mockRatingRep.index++,
            nftId: mod.nftId,
            userId: mod.userId,
            rating: mod.rating,
            deletedAt: null,
        }

        mockRatingRep.ratingArray.push(rating);

        return rating;

    }),
    updateRating: jest.fn().mockImplementation((id: number, ratingData) => {
        let elt = mockRatingRep.ratingArray.find((rating) => rating.id === id);
        if (!elt)
            throw new HttpException('Rating not found', 404);
        if (!ratingData)
            return elt;
        elt.nftId = ratingData.nftId ? ratingData.nftId : elt.nftId;
        elt.userId = ratingData.userId ? ratingData.userId : elt.userId;
        elt.rating = ratingData.rating ? ratingData.rating : elt.rating;

        return elt;
    }),
    removeRating: jest.fn().mockImplementation((id: number) => {
        let elt = mockRatingRep.ratingArray.find((rating) => rating.id == id);
        if (!elt)
            return null;
        elt.deletedAt = new Date();
        mockRatingRep.ratingArray = mockRatingRep.ratingArray.filter((rating) => rating.id !== id);
        return elt;
    }), 
    getRating : jest.fn().mockImplementation((id: number) => {
        let elt = mockRatingRep.ratingArray.find((rating) => rating.id == id);
        if (!elt)
            return null;
        return elt;
    }), 
    getRatings : jest.fn().mockImplementation((offset, limit) => {
        return mockRatingRep.ratingArray.slice(offset, offset + limit);
    }),
    getRatingsByNftId : jest.fn().mockImplementation((nftId: number, offset, limit) => {
        return mockRatingRep.ratingArray.filter((rating) => rating.nftId == nftId).slice(offset, offset + limit);
    }),
    getRatingsByUserId : jest.fn().mockImplementation((userId: number, offset, limit) => {
        return mockRatingRep.ratingArray.filter((rating) => rating.userId == userId).slice(offset, offset + limit);
    }),
    hasRated : jest.fn().mockImplementation((userId: number, nftId: number) => {
        return mockRatingRep.ratingArray.some((rating) => rating.userId == userId && rating.nftId == nftId);
    }),
    getAverageRatedNfts : jest.fn().mockImplementation((offset, limit) => {
        let r = groupBy(mockRatingRep.ratingArray, 'nftId');

        if (r == null)
            return [];

        let arr = [];

        Object.keys(r).forEach((key) => {
            let sum = 0;

            r[key].forEach((rating) => {
                sum += rating.rating;
            });
            arr.push({nftId: r[key[0]].at(0).nftId, _avg:
                { rating : sum / key.length } });
        });

        // sort by _avg.rating
        arr.sort((a, b) => {
            return b._avg.rating - a._avg.rating;
        });

        return arr;
    }),
    getAverageRatedNftsPublished : jest.fn().mockImplementation((offset, limit) => {
        let r = groupBy(mockRatingRep.ratingArray, 'nftId');

        if (r == null)
            return [];

        let arr = [];

        Object.keys(r).forEach((key) => {
            let sum = 0;

            r[key].forEach((rating) => {
                sum += rating.rating;
            });
            arr.push({nftId: r[key[0]].at(0).nftId, _avg:
                { rating : sum / key.length } });
        });

        // sort by _avg.rating
        arr.sort((a, b) => {
            return b._avg.rating - a._avg.rating;
        });

        return arr;
    }), 
}