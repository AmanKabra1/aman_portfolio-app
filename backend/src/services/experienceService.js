import prisma from '../config/database.js';

export const createExperience = async (data) => {
  return prisma.experience.create({
    data: {
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    },
  });
};

export const getAllExperience = async () => {
  return prisma.experience.findMany({
    orderBy: {
      startDate: 'desc',
    },
  });
};

export const getExperienceById = async (id) => {
  return prisma.experience.findUnique({
    where: { id },
  });
};

export const updateExperience = async (id, data) => {
  const updateData = { ...data };

  if (data.startDate) {
    updateData.startDate = new Date(data.startDate);
  }

  if (data.endDate) {
    updateData.endDate = new Date(data.endDate);
  }

  return prisma.experience.update({
    where: { id },
    data: updateData,
  });
};

export const deleteExperience = async (id) => {
  return prisma.experience.delete({
    where: { id },
  });
};
