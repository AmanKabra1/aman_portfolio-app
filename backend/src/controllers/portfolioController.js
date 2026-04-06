import { successResponse, errorResponse } from '../utils/response.js';
import {
  getPortfolioData,
  getAbout,
  updateAbout,
  getContact,
  updateContact,
} from '../services/portfolioService.js';

export const getPortfolio = async (req, res, next) => {
  try {
    const data = await getPortfolioData();
    return successResponse(res, 'Portfolio data retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

export const getAboutData = async (req, res, next) => {
  try {
    const data = await getAbout();
    return successResponse(res, 'About data retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

export const updateAboutData = async (req, res, next) => {
  try {
    const data = await updateAbout(req.body);
    return successResponse(res, 'About data updated successfully', data);
  } catch (error) {
    next(error);
  }
};

export const getContactData = async (req, res, next) => {
  try {
    const data = await getContact();
    return successResponse(res, 'Contact data retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

export const updateContactData = async (req, res, next) => {
  try {
    const data = await updateContact(req.body);
    return successResponse(res, 'Contact data updated successfully', data);
  } catch (error) {
    next(error);
  }
};
