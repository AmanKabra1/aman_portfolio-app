require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  await prisma.projectTechnology.deleteMany();
  await prisma.project.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.about.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.admin.deleteMany();

  // Create Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.admin.create({
    data: {
      name: 'Madhav Malhotra',
      email: 'admin@portfolio.com',
      passwordHash: adminPassword,
    },
  });
  console.log('✅ Admin created:', admin.email);

  const userPassword = await bcrypt.hash('user123', 10);

  const user = await prisma.user.create({
    data: {
      email: 'user@portfolio.com',
      username: 'madhav',
      passwordHash: userPassword,
      firstName: 'Madhav',
      lastName: 'Malhotra',
    },
  });

  console.log('✅ User created:', user.email);

  // Create About
  await prisma.about.create({
    data: {
      bio: 'Full Stack Developer',
      description:
        'I am a passionate full-stack developer with expertise in modern web technologies...',
      yearsExperience: 5,
    },
  });

  // Create Contact
  await prisma.contact.create({
    data: {
      email: 'madhav@example.com',
      phone: '+91 9876543210',
      location: 'India',
    },
  });

  const slug = 'my-portfolio-' + Date.now();
  const portfolio = await prisma.portfolio.create({
    data: {
      title: 'My Portfolio',
      slug: slug,
      userId: user.id, // ✅ LINK TO ADMIN
    },
  });

  // Create Skills
  const skills = await prisma.skill.createMany({
    data: [
      {
        name: 'JavaScript',
        category: 'Language',
        level: 95,
        portfolioId: portfolio.id,
      },
      {
        name: 'TypeScript',
        category: 'Language',
        level: 90,
        portfolioId: portfolio.id,
      },
      {
        name: 'React',
        category: 'Frontend',
        level: 95,
        portfolioId: portfolio.id,
      },
      {
        name: 'Angular',
        category: 'Frontend',
        level: 85,
        portfolioId: portfolio.id,
      },
      {
        name: 'Node.js',
        category: 'Backend',
        level: 90,
        portfolioId: portfolio.id,
      },
      {
        name: 'Express.js',
        category: 'Backend',
        level: 88,
        portfolioId: portfolio.id,
      },
      {
        name: 'PostgreSQL',
        category: 'Database',
        level: 85,
        portfolioId: portfolio.id,
      },
      {
        name: 'MongoDB',
        category: 'Database',
        level: 80,
        portfolioId: portfolio.id,
      },
      {
        name: 'Prisma',
        category: 'ORM',
        level: 90,
        portfolioId: portfolio.id,
      },
      {
        name: 'Docker',
        category: 'DevOps',
        level: 75,
        portfolioId: portfolio.id,
      },
    ],
  });
  console.log(`✅ ${skills.count} skills created`);

  // Create Projects
  const projects = [
    {
      title: 'E-Commerce Platform',
      description: 'Full-stack e-commerce platform',
      imageUrl: 'https://via.placeholder.com/400x300',
      liveUrl: 'https://ecommerce-demo.com',
      githubUrl: 'https://github.com/madhav/ecommerce',
      featured: true,
      technologies: ['React', 'Node.js', 'PostgreSQL'],
    },
  ];

  for (const projectData of projects) {
    const { technologies, ...projectInfo } = projectData;

    const project = await prisma.project.create({
      data: { ...projectInfo, portfolioId: portfolio.id },
    });

    for (const tech of technologies) {
      await prisma.projectTechnology.create({
        data: {
          projectId: project.id,
          technologyName: tech,
        },
      });
    }
  }

  // Create Experience
  const experiences = await prisma.experience.createMany({
    data: [
      {
        company: 'Tech Solutions Inc.',
        position: 'Senior Developer',
        location: 'India', // ✅ optional but good
        description: 'Building scalable apps',
        startDate: new Date('2021-01-15'),
        endDate: new Date('2026-12-31'),
        isCurrent: false, // ✅ REQUIRED LOGIC
        portfolioId: portfolio.id, // ✅ dynamic (not hardcoded 1)
      },
    ],
  });
  console.log(`✅ ${experiences.count} experiences created`);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('💥 Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
