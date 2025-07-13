import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

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
  const categories = await Promise.all([
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

  // Create sample students
  const studentData = [
    {
      email: 'john.smith@example.com',
      password: 'password123',
      name: 'John Smith',
      role: 'STUDENT',
      university: 'Tech University',
      major: 'Computer Science',
      graduationYear: 2025,
    },
    {
      email: 'emma.wilson@example.com',
      password: 'password123',
      name: 'Emma Wilson',
      role: 'STUDENT',
      university: 'Design Institute',
      major: 'Digital Design',
      graduationYear: 2024,
    },
    {
      email: 'michael.brown@example.com',
      password: 'password123',
      name: 'Michael Brown',
      role: 'STUDENT',
      university: 'Business School',
      major: 'Digital Marketing',
      graduationYear: 2024,
    },
  ];

  for (const data of studentData) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role as 'STUDENT',
        student: {
          create: {
            university: data.university,
            major: data.major,
            graduationYear: data.graduationYear,
          },
        },
      },
    });
  }

  // Create sample clients
  const clientData = [
    {
      email: 'sarah.johnson@example.com',
      password: 'password123',
      name: 'Sarah Johnson',
      role: 'CLIENT',
      company: 'TechCorp Solutions',
    },
    {
      email: 'david.chen@example.com',
      password: 'password123',
      name: 'David Chen',
      role: 'CLIENT',
      company: 'Innovative Startup',
    },
  ];

  for (const data of clientData) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role as 'CLIENT',
        client: {
          create: {
            company: data.company,
          },
        },
      },
    });
  }

  // Get references for creating services and gigs
  const webDevCategory = categories.find(c => c.name === 'Web Development')!;
  const designCategory = categories.find(c => c.name === 'Design')!;
  const marketingCategory = categories.find(c => c.name === 'Marketing')!;

  const webDevStudent = await prisma.student.findFirst({
    where: { user: { email: 'john.smith@example.com' } },
  });
  const designStudent = await prisma.student.findFirst({
    where: { user: { email: 'emma.wilson@example.com' } },
  });
  const marketingStudent = await prisma.student.findFirst({
    where: { user: { email: 'michael.brown@example.com' } },
  });

  // Create services
  await Promise.all([
    prisma.service.create({
      data: {
        title: 'Full-Stack Web Development',
        description: 'Complete web application development using React and Node.js',
        price: 45.0,
        studentId: webDevStudent!.id,
        categoryId: webDevCategory.id,
      },
    }),
    prisma.service.create({
      data: {
        title: 'WordPress Website Development',
        description: 'Custom WordPress website with responsive design',
        price: 35.0,
        studentId: webDevStudent!.id,
        categoryId: webDevCategory.id,
      },
    }),
    prisma.service.create({
      data: {
        title: 'UI/UX Design',
        description: 'Modern and user-friendly interface design for web and mobile',
        price: 40.0,
        studentId: designStudent!.id,
        categoryId: designCategory.id,
      },
    }),
    prisma.service.create({
      data: {
        title: 'Logo and Branding',
        description: 'Professional logo design and brand identity package',
        price: 50.0,
        studentId: designStudent!.id,
        categoryId: designCategory.id,
      },
    }),
    prisma.service.create({
      data: {
        title: 'Social Media Marketing',
        description: 'Strategic social media management and content creation',
        price: 30.0,
        studentId: marketingStudent!.id,
        categoryId: marketingCategory.id,
      },
    }),
    prisma.service.create({
      data: {
        title: 'SEO Optimization',
        description: 'Website optimization for better search engine rankings',
        price: 35.0,
        studentId: marketingStudent!.id,
        categoryId: marketingCategory.id,
      },
    }),
  ]);

  // Get client references
  const techCorpClient = await prisma.client.findFirst({
    where: { user: { email: 'sarah.johnson@example.com' } },
  });
  const startupClient = await prisma.client.findFirst({
    where: { user: { email: 'david.chen@example.com' } },
  });

  // Create gigs
  await Promise.all([
    prisma.gig.create({
      data: {
        title: 'E-commerce Website Development',
        description: 'Need a full-featured e-commerce website with payment integration',
        budget: 1500.0,
        status: 'OPEN',
        clientId: techCorpClient!.id,
        categoryId: webDevCategory.id,
      },
    }),
    prisma.gig.create({
      data: {
        title: 'Mobile App UI Design',
        description: 'Looking for a modern and intuitive UI design for our mobile app',
        budget: 800.0,
        status: 'OPEN',
        clientId: techCorpClient!.id,
        categoryId: designCategory.id,
      },
    }),
    prisma.gig.create({
      data: {
        title: 'Digital Marketing Campaign',
        description: 'Need help with social media marketing and content strategy',
        budget: 600.0,
        status: 'OPEN',
        clientId: startupClient!.id,
        categoryId: marketingCategory.id,
      },
    }),
    prisma.gig.create({
      data: {
        title: 'Company Website Redesign',
        description: 'Complete redesign of our company website with modern look',
        budget: 1200.0,
        status: 'OPEN',
        clientId: startupClient!.id,
        categoryId: webDevCategory.id,
      },
    }),
  ]);

  console.log('Database has been seeded! 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 