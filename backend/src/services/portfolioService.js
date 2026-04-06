import prisma from '../config/database.js';

const emptyContact = {
  email: '',
  phone: '',
  location: '',
  github: null,
  linkedin: null,
  medium: null,
  tableau: null,
  leetcode: null,
  instagram: null,
  youtube: null,
  portfolio: null,
};

const normalizeOptionalUrl = value => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === '') {
    return null;
  }

  return value;
};

const normalizeOptionalText = value => {
  if (value === undefined || value === '') {
    return undefined;
  }

  return value;
};

export const getPortfolioData = async () => {
  const [about, contact, skills, projects, experience] = await Promise.all([
    prisma.about.findFirst(),
    prisma.contact.findFirst(),
    prisma.skill.findMany(),
    prisma.project.findMany({
      include: {
        technologies: true,
      },
    }),
    prisma.experience.findMany(),
  ]);

  // Transform projects to include technologies array
  const transformedProjects = projects.map(project => ({
    ...project,
    technologies: project.technologies.map(t => t.technologyName),
  }));

  return {
    about: about || {
      bio: '',
      description: '',
      yearsExperience: 0,
    },
    contact: contact ? { ...emptyContact, ...contact } : emptyContact,
    skills: skills || [],
    projects: transformedProjects || [],
    experience: experience || [],
  };
};

export const getAbout = async () => {
  const about = await prisma.about.findFirst();
  return about || {
    bio: '',
    description: '',
    yearsExperience: 0,
  };
};

export const updateAbout = async (data) => {
  const about = await prisma.about.findFirst();

  if (!about) {
    // Create if doesn't exist
    return prisma.about.create({
      data: {
        bio: data.bio || '',
        description: data.description || '',
        yearsExperience: data.yearsExperience || 0,
      },
    });
  }

  return prisma.about.update({
    where: { id: about.id },
    data: {
      ...(data.bio !== undefined && { bio: data.bio }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.yearsExperience !== undefined && { yearsExperience: data.yearsExperience }),
    },
  });
};

export const getContact = async () => {
  const contact = await prisma.contact.findFirst();
  return contact ? { ...emptyContact, ...contact } : emptyContact;
};

export const updateContact = async (data) => {
  const contact = await prisma.contact.findFirst();
  const contactData = {
    ...(normalizeOptionalText(data.email) !== undefined && { email: normalizeOptionalText(data.email) }),
    ...(normalizeOptionalText(data.phone) !== undefined && { phone: normalizeOptionalText(data.phone) }),
    ...(normalizeOptionalText(data.location) !== undefined && { location: normalizeOptionalText(data.location) }),
    ...(data.github !== undefined && { github: normalizeOptionalUrl(data.github) }),
    ...(data.linkedin !== undefined && { linkedin: normalizeOptionalUrl(data.linkedin) }),
    ...(data.medium !== undefined && { medium: normalizeOptionalUrl(data.medium) }),
    ...(data.tableau !== undefined && { tableau: normalizeOptionalUrl(data.tableau) }),
    ...(data.leetcode !== undefined && { leetcode: normalizeOptionalUrl(data.leetcode) }),
    ...(data.instagram !== undefined && { instagram: normalizeOptionalUrl(data.instagram) }),
    ...(data.youtube !== undefined && { youtube: normalizeOptionalUrl(data.youtube) }),
    ...(data.portfolio !== undefined && { portfolio: normalizeOptionalUrl(data.portfolio) }),
  };

  if (!contact) {
    // Create if doesn't exist
    return prisma.contact.create({
      data: {
        ...emptyContact,
        ...contactData,
      },
    });
  }

  return prisma.contact.update({
    where: { id: contact.id },
    data: contactData,
  });
};
