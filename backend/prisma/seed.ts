import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean the database
  await prisma.review.deleteMany();
  await prisma.activityLogs.deleteMany();
  await prisma.message.deleteMany();
  await prisma.gig.deleteMany();
  await prisma.service.deleteMany();
  await prisma.student.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();

  // Create categories
  await Promise.all([
    prisma.category.create({
      data: {
        name: 'Web Development',
        description: 'All kinds of web development services',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Mobile Development',
        description: 'Mobile app development services',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Design',
        description: 'Graphic design, UI/UX design services',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Writing',
        description: 'Content writing and copywriting services',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Marketing',
        description: 'Digital marketing services',
      },
    }),
  ]);

  console.log('Database has been seeded with categories! 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 