import express from "express";
const bookRouter = express.Router();
import { getBooks, getBookById, createBook, updateBook, deleteBook } from "../controllers/book.controller.js";
import { validateId } from "../middlewares/validateId.js";

bookRouter.param('id', validateId);

bookRouter.get('/', getBooks);
bookRouter.get('/:id', getBookById);
bookRouter.post('/', createBook);
bookRouter.put('/:id', updateBook);
bookRouter.delete('/:id', deleteBook);

export {bookRouter};
