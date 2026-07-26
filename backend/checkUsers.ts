import prisma from './src/utils/prisma';

async function main() {
  const users = await prisma.user.findMany();
  console.log("Users in DB:", users);
}

main().catch(console.error).finally(() => prisma.$disconnect());
