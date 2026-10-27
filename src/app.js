import express from "express";
import { bookRouter } from "./routes/book.route.js";
import { authorRouter } from "./routes/author.route.js";
import { loanRouter } from "./routes/loan.route.js";
import { notFound } from "./middlewares/notFound.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

// parses JSON request bodies into req.body
app.use(express.json());

app.use("/api/books", bookRouter);
app.use("/api/authors", authorRouter);
app.use("/api/loans", loanRouter);

// these two must come after the routes
app.use(notFound);
app.use(errorHandler);

export {app};
