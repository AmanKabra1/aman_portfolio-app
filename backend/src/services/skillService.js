import prisma from '../config/database.js';

export const createSkill = async (data) => {
  return prisma.skill.create({
    data,
  });
};

export const getAllSkills = async () => {
  return prisma.skill.findMany();
};

export const getSkillById = async (id) => {
  return prisma.skill.findUnique({
    where: { id },
  });
};

export const updateSkill = async (id, data) => {
  return prisma.skill.update({
    where: { id },
    data,
  });
};

export const deleteSkill = async (id) => {
  return prisma.skill.delete({
    where: { id },
  });
};
