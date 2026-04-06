import prisma from '../config/database.js';

export const createProject = async (data) => {
  const { technologies, ...projectData } = data;

  const project = await prisma.project.create({
    data: projectData,
  });

  if (technologies && technologies.length > 0) {
    await prisma.projectTechnology.createMany({
      data: technologies.map(tech => ({
        projectId: project.id,
        technologyName: tech,
      })),
    });
  }

  return getProjectById(project.id);
};

export const getAllProjects = async () => {
  const projects = await prisma.project.findMany({
    include: {
      technologies: true,
    },
  });

  return projects.map(project => ({
    ...project,
    technologies: project.technologies.map(t => t.technologyName),
  }));
};

export const getProjectById = async (id) => {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      technologies: true,
    },
  });

  if (!project) return null;

  return {
    ...project,
    technologies: project.technologies.map(t => t.technologyName),
  };
};

export const updateProject = async (id, data) => {
  const { technologies, ...projectData } = data;

  // Update project
  const project = await prisma.project.update({
    where: { id },
    data: projectData,
  });

  // Update technologies if provided
  if (technologies !== undefined) {
    await prisma.projectTechnology.deleteMany({
      where: { projectId: id },
    });

    if (technologies.length > 0) {
      await prisma.projectTechnology.createMany({
        data: technologies.map(tech => ({
          projectId: id,
          technologyName: tech,
        })),
      });
    }
  }

  return getProjectById(id);
};

export const deleteProject = async (id) => {
  return prisma.project.delete({
    where: { id },
  });
};
