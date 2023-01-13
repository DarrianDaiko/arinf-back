
// const { PrismaClient } = require('@prisma/client');
// const { NFTStatus } = require('@prisma/client');

// const prisma = new PrismaClient();


// const bcrypt = require('bcrypt');


// async function wipe() {


//     // Wipe the database
//     await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE;`
//     await prisma.$executeRaw`TRUNCATE TABLE "NFT" CASCADE;`
//     await prisma.$executeRaw`TRUNCATE TABLE "Team" CASCADE;`
//     await prisma.$executeRaw`TRUNCATE TABLE "Rating" CASCADE;`
//     await prisma.$executeRaw`TRUNCATE TABLE "Sell" CASCADE;`
//     await prisma.$executeRaw`TRUNCATE TABLE "Collection" CASCADE;`

//     console.log('Database wiped')

// }
// wipe()
//     .then(async () => {
//         await prisma.$disconnect()
//     })
//     .catch(async (e) => {
//         console.error(e)
//         await prisma.$disconnect()
//         process.exit(1)
//     })