import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/authUtils.js';

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
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.admin.create({
    data: {
      name: 'Madhav Malhotra',
      email: 'admin@portfolio.com',
      passwordHash: adminPassword,
    },
  });
  console.log('✅ Admin created:', admin.email);

  // Create About
  const about = await prisma.about.create({
    data: {
      bio: 'Full Stack Developer',
      description: 'I am a passionate full-stack developer with expertise in modern web technologies. I love building scalable and user-friendly applications that solve real-world problems. With a strong foundation in both frontend and backend development, I create seamless digital experiences.',
      yearsExperience: 5,
    },
  });
  console.log('✅ About section created');

  // Create Contact
  const contact = await prisma.contact.create({
    data: {
      email: 'madhav@example.com',
      phone: '+91 9876543210',
      location: 'India',
    },
  });
  console.log('✅ Contact section created');

  // Create Skills
  const skills = await prisma.skill.createMany({
    data: [
      { name: 'JavaScript', category: 'Language', level: 95 },
      { name: 'TypeScript', category: 'Language', level: 90 },
      { name: 'React', category: 'Frontend', level: 95 },
      { name: 'Angular', category: 'Frontend', level: 85 },
      { name: 'Node.js', category: 'Backend', level: 90 },
      { name: 'Express.js', category: 'Backend', level: 88 },
      { name: 'PostgreSQL', category: 'Database', level: 85 },
      { name: 'MongoDB', category: 'Database', level: 80 },
      { name: 'Prisma', category: 'ORM', level: 90 },
      { name: 'Docker', category: 'DevOps', level: 75 },
    ],
  });
  console.log(`✅ ${skills.count} skills created`);

  // Create Projects
  const projects = [
    {
      title: 'E-Commerce Platform',
      description: 'A full-stack e-commerce platform built with React, Node.js, and PostgreSQL. Features include product management, shopping cart, order processing, and payment integration with Stripe.',
      image: 'https://via.placeholder.com/400x300?text=E-Commerce',
      liveLink: 'https://ecommerce-demo.com',
      githubLink: 'https://github.com/madhav/ecommerce',
      featured: true,
      technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
    },
    {
      title: 'Task Management App',
      description: 'A collaborative task management application with real-time updates. Built with Angular for the frontend and Express.js for the backend. Features include task creation, assignment, and progress tracking.',
      image: 'https://via.placeholder.com/400x300?text=Task+Manager',
      liveLink: 'https://taskmanager-demo.com',
      githubLink: 'https://github.com/madhav/task-manager',
      featured: true,
      technologies: ['Angular', 'Express.js', 'MongoDB', 'Socket.io'],
    },
    {
      title: 'Weather Application',
      description: 'A weather forecasting application that provides real-time weather data, forecasts, and alerts. Built with React and integrated with OpenWeather API.',
      image: 'https://via.placeholder.com/400x300?text=Weather+App',
      liveLink: 'https://weather-demo.com',
      githubLink: 'https://github.com/madhav/weather-app',
      featured: false,
      technologies: ['React', 'OpenWeather API', 'Tailwind CSS'],
    },
  ];

  for (const projectData of projects) {
    const { technologies, ...projectInfo } = projectData;

    const project = await prisma.project.create({
      data: projectInfo,
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
  console.log(`✅ ${projects.length} projects created`);

  // Create Experience
  const experiences = await prisma.experience.createMany({
    data: [
      {
        company: 'Tech Solutions Inc.',
        position: 'Senior Full Stack Developer',
        duration: '2021 - Present',
        description: 'Leading the development of scalable web applications using modern technologies. Mentoring junior developers and contributing to architecture decisions.',
        startDate: new Date('2021-01-15'),
        endDate: new Date('2026-12-31'),
      },
      {
        company: 'Digital Innovations Ltd',
        position: 'Full Stack Developer',
        duration: '2019 - 2021',
        description: 'Developed and maintained multiple client projects using React and Node.js. Implemented RESTful APIs and optimized database queries for better performance.',
        startDate: new Date('2019-06-01'),
        endDate: new Date('2021-01-14'),
      },
      {
        company: 'StartUp Ventures',
        position: 'Junior Web Developer',
        duration: '2018 - 2019',
        description: 'Built responsive web interfaces using HTML, CSS, and JavaScript. Collaborating with designers and backend developers to create seamless user experiences.',
        startDate: new Date('2018-03-01'),
        endDate: new Date('2019-05-31'),
      },
    ],
  });
  console.log(`✅ ${experiences.count} experiences created`);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch(e => {
    console.error('💥 Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
