import { Request, Response } from 'express';
import { sendSuccess, sendPaginated } from '../utils/response';
import { getPagination } from '../utils/pagination';
import * as customerService from '../services/customer.service';

export const listCustomers = async (req: Request, res: Response) => {
  const { page, limit } = getPagination(req);
  const { data, total } = await customerService.getCustomers(String(req.user!._id), page, limit, req.query.search as string);
  sendPaginated(res, data, total, page, limit);
};

export const getCustomer = async (req: Request, res: Response) => {
  const customer = await customerService.getCustomerById(String(req.user!._id), req.params.id);
  sendSuccess(res, customer, 'Customer details');
};
