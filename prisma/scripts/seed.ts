

// const { PrismaClient } = require('@prisma/client');
// const { NFTStatus } = require('@prisma/client');

// const prisma = new PrismaClient();


// const bcrypt = require('bcrypt');

// // const prisma = new PrismaClient();

// async function main() {

//     const password = await bcrypt.hash('password', 10);
    

//     // insert admin user
//     const adminAccount = await prisma.user.create({
//         data: {
//         email: 'admin',
//         name: 'admin',
//         password: password,
//         blockChainAddress: '',
//         role: 'ADMIN',
//         },
//     });
//     console.log(`Created user with id: ${adminAccount.id} and pwd: ${adminAccount.password}`);

//     // insert 10 users as sample

//     // sample email and name
//     const email = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
//     const name = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];

//     // sample blockchain address
//     const blockChainAddress = ['0x1', '0x2', '0x3', '0x4', '0x5', '0x6', '0x7', '0x8', '0x9', '0x10'];

//     // sample passwords
//     const passwords = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10'];

//     // hash passwords

//     const hashed_passwords = [];
//     for (let i = 0; i < 10; i++) {
//         hashed_passwords.push(await bcrypt.hash(passwords[i], 10));
//     }

//     let users = [];

//     for (let i = 0; i < 10; i++) {
//         const user = await prisma.user.create({
//         data: {
//             email: `${email[i]}@gmail.com`,
//             name: `${name[i]}`,
//             password: `${hashed_passwords[i]}`,
//             blockChainAddress: `${blockChainAddress[i]}`,
//             role: 'USER',
//         },
//         });
//         console.log(`Created user with id: ${user.id}, email: ${user.email} 
//         and pwd: ${user.password} plain is ${passwords[i]}`);
//         users.push(user);
//     }

//     // insert 15 NFTs as sample

//     // sample name and description

//     const nft_name = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o'];

//     // sample price

//     const nft_price = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

//     // sample image

//     const nft_image = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o'];

//     // sample sellerId

//     const ownerId = [adminAccount.id, adminAccount.id, users.at(0).id,
//         users.at(4).id, users.at(4).id, users.at(5).id, users.at(2).id, 
//         users.at(7).id, users.at(8).id, users.at(9).id, users.at(9).id, 
//         users.at(5).id, users.at(1).id, users.at(8).id, adminAccount.id];

//     // sample NFTStatus

//     const nft_status = [ NFTStatus.PUBLISHED, 
//         NFTStatus.PUBLISHED, NFTStatus.PUBLISHED, NFTStatus.PUBLISHED,
//         NFTStatus.DRAFT, NFTStatus.DRAFT, NFTStatus.PUBLISHED,
//         NFTStatus.PUBLISHED, NFTStatus.PUBLISHED, NFTStatus.DRAFT,
//         NFTStatus.PUBLISHED, NFTStatus.PUBLISHED, NFTStatus.ARCHIVED,
//         NFTStatus.PUBLISHED, NFTStatus.ARCHIVED];

//     const nfts = [];
//     for (let i = 0; i < 15; i++) {

//         const nft = await prisma.nFT.create({
//         data: {
//             name: `nft${nft_name[i]}`,
//             price: nft_price[i],
//             image: `img${nft_image[i]}`,
//             status: nft_status[i],
//             ownerId: ownerId[i],

//         },
//         });
//         nfts.push(nft);
//         console.log(`Created nft with id: ${nft.id}`);
//     }

//     // insert a couple of teams

//     const team1 = await prisma.team.create({
//         data: {
//         name: 'team1',
//         creatorId: adminAccount.id,
//         },
//     });
//     console.log(`Created team with id: ${team1.id}`);

//     const team2 = await prisma.team.create({
//         data: {
//         name: 'team2',
//         creatorId: users.at(2).id
//         },
//     });
//     console.log(`Created team with id: ${team2.id}`);

//     // make a few people join each team

//     team1.usersId.push(users.at(0).id);
//     team1.usersId.push(users.at(1).id);
//     team1.usersId.push(adminAccount.id);

//     // Update users in team1

//     const updateAdmin = await prisma.user.update({
//         where: {
//         id: adminAccount.id,
//         },
//         data: {
//         teamId: team1.id,
//         },
//     });

//     const updateu0 = await prisma.user.update({
//         where: {
//         id: users.at(0).id,
//         },
//         data: {
//         teamId: team1.id,
//         },
//     });

//     const updateu1 = await prisma.user.update({
//         where: {
//         id: users.at(1).id,
//         },
//         data: {
//         teamId: team1.id,
//         },
//     });

//     await prisma.team.update({
//         where: {
//         id: team1.id,
//         },
//         data: {
//         usersId: team1.usersId,
//         },
//     });

//     console.log(`team1 usersId: ${team1.usersId}`)

//     team2.usersId.push(users.at(2).id);
//     team2.usersId.push(users.at(3).id);
//     team2.usersId.push(users.at(4).id);
//     team2.usersId.push(users.at(5).id);
//     team2.usersId.push(users.at(6).id);
//     team2.usersId.push(users.at(7).id);
//     team2.usersId.push(users.at(9).id);

//     // update users in team2

//     const updateu2 = await prisma.user.update({
//         where: {
//         id: users.at(2).id,
//         },
//         data: {
//         teamId: team2.id,
//         },
//     });

//     const updateu3 = await prisma.user.update({
//         where: {
//         id: users.at(3).id,
//         },
//         data: {
//         teamId: team2.id,
//         },
//     });

//     const updateu4 = await prisma.user.update({
//         where: {
//         id: users.at(4).id,
//         },
//         data: {
//         teamId: team2.id,
//         },
//     });

//     const updateu5 = await prisma.user.update({
//         where: {
//         id: users.at(5).id,
//         },
//         data: {
//         teamId: team2.id,
//         },
//     });

//     const updateu6 = await prisma.user.update({
//         where: {
//         id: users.at(6).id,
//         },
//         data: {
//         teamId: team2.id,
//         },
//     });

//     const updateu7 = await prisma.user.update({
//         where: {
//         id: users.at(7).id,
//         },
//         data: {
//         teamId: team2.id,
//         },
//     });

//     const updateu9 = await prisma.user.update({
//         where: {
//         id: users.at(9).id,
//         },
//         data: {
//         teamId: team2.id,
//         },
//     });


//     await prisma.team.update({
//         where: {
//         id: team2.id,
//         },
//         data: {
//         usersId: team2.usersId,
//         },
//     });

//     console.log(`team2 usersId: ${team2.usersId}`)
//     // rating a few NFTs

//     const rate1 = await prisma.rating.create({
//         data: {
//         rating: 5,
//         userId: users.at(2).id,
//         nftId: nfts.at(0).id,
//         },
//     });

//     const rate2 = await prisma.rating.create({
//         data: {
//         rating: 4,
//         userId: users.at(4).id,
//         nftId: nfts.at(0).id,
//         },
//     });

//     const rate3 = await prisma.rating.create({
//         data: {
//         rating: 3,
//         userId: users.at(0).id,
//         nftId: nfts.at(8).id,
//         },
//     });

//     const rate4 = await prisma.rating.create({
//         data: {
//         rating: 2,
//         userId: users.at(3).id,
//         nftId: nfts.at(0).id,
//         },
//     });

//     const rate5 = await prisma.rating.create({
//         data: {
//         rating: 1,
//         userId: users.at(1).id,
//         nftId: nfts.at(9).id,
//         },
//     });

//     // log ratings

//     console.log(`rate1: ${rate1.rating}`);
//     console.log(`rate2: ${rate2.rating}`);
//     console.log(`rate3: ${rate3.rating}`);
//     console.log(`rate4: ${rate4.rating}`);
//     console.log(`rate5: ${rate5.rating}`);



//     // create 3 collections

//     const collection1 = await prisma.collection.create({
//         data: {
//         name: 'collection1',
//         creatorId: adminAccount.id,
//         status: NFTStatus.PUBLISHED,
//         nftsId: [nfts.at(0).id, nfts.at(1).id, nfts.at(14).id],
//         },
//     });

//     const collection2 = await prisma.collection.create({
//         data: {
//         name: 'collection2',
//         creatorId: users.at(4).id,
//         status: NFTStatus.PUBLISHED,
//         nftsId: [nfts.at(3).id, nfts.at(4).id],
//         },
//     });

//     const collection3 = await prisma.collection.create({
//         data: {
//         name: 'collection3',
//         creatorId: users.at(9).id,
//         status: NFTStatus.PUBLISHED,
//         nftsId: [nfts.at(10).id, nfts.at(11).id],
//         },
//     });

//     // log collections

//     console.log(`collection1: ${collection1.name}`);
//     console.log(`collection2: ${collection2.name}`);
//     console.log(`collection3: ${collection3.name}`);

//     // create 5 sells

//     const sell1 = await prisma.sell.create({
//         data: {
//         price: 1,
//         sellerId: users.at(0).id,
//         buyerId: users.at(1).id,
//         nftId: nfts.at(6).id,
//         },
//     });

//     const sell2 = await prisma.sell.create({
//         data: {
//         price: 2,
//         sellerId: users.at(5).id,
//         buyerId: adminAccount.id,
//         nftId: nfts.at(5).id,
//         },
//     });

//     const sell3 = await prisma.sell.create({
//         data: {
//         price: 3,
//         sellerId: users.at(1).id,
//         buyerId: users.at(9).id,
//         nftId: nfts.at(12).id,
//         },
//     });

//     // update NFT data as owner changed

//     const updateNFT1 = await prisma.nFT.update({
//         where: {
//         id: nfts.at(6).id,
//         },
//         data: {
//         ownerId: users.at(1).id,
//         previousOwnersId: [users.at(0).id],
//         },
//     });

//     const updateNFT2 = await prisma.nFT.update({
//         where: {
//         id: nfts.at(5).id,
//         },
//         data: {
//         ownerId: adminAccount.id,
//         previousOwnersId: [users.at(5).id],
//         },
//     });

//     const updateNFT3 = await prisma.nFT.update({
//         where: {
//         id: nfts.at(12).id,
//         },
//         data: {
//         ownerId: users.at(9).id,
//         previousOwnersId: [users.at(1).id],
//         },
//     });

//     // log sells

//     console.log(`sell1: ${sell1.price}`);
//     console.log(`sell2: ${sell2.price}`);
//     console.log(`sell3: ${sell3.price}`);

// }
// main()
//   .then(async () => {
//     await prisma.$disconnect()
//   })
//   .catch(async (e) => {
//     console.error(e)
//     await prisma.$disconnect()
//     process.exit(1)
//   })