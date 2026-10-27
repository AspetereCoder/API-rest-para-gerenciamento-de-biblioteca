import express from "express";
const loanRouter = express.Router();
import { getLoans, getLoanById, createLoan, returnLoan } from "../controllers/loan.controller.js";
import { validateId } from "../middlewares/validateId.js";

loanRouter.param('id', validateId);

loanRouter.get('/', getLoans);
loanRouter.get('/:id', getLoanById);
loanRouter.post('/', createLoan);
loanRouter.post('/:id/return', returnLoan);

export {loanRouter};
