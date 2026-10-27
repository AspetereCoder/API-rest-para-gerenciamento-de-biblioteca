import express from "express";
const authorRouter = express.Router();
import { getAuthors, getAuthorById, getAuthorBooks, createAuthor, updateAuthor, deleteAuthor } from "../controllers/author.controller.js";
import { validateId } from "../middlewares/validateId.js";

authorRouter.param('id', validateId);

authorRouter.get('/', getAuthors);
authorRouter.get('/:id', getAuthorById);
authorRouter.get('/:id/books', getAuthorBooks);
authorRouter.post('/', createAuthor);
authorRouter.put('/:id', updateAuthor);
authorRouter.delete('/:id', deleteAuthor);

export {authorRouter};
