import { query } from "../data/db.js"
import { validateBook, validateBookQuery } from "../validators/book.validator.js";

// GET /api/books?available=true&author_id=1&title=casmurro&page=1&limit=10
async function getBooks(req, res) {
    const error = validateBookQuery(req.query);

    if (error) {
        return res.status(400).json({ error });
    }

    const { available, author_id, title, page, limit } = req.query;

    // the WHERE clause is built dynamically, but values always go through $n parameters
    const conditions = [];
    const params = [];

    if (available !== undefined) {
        params.push(available === 'true');
        conditions.push(`available = $${params.length}`);
    }

    if (author_id !== undefined) {
        params.push(Number(author_id));
        conditions.push(`author_id = $${params.length}`);
    }

    if (title !== undefined) {
        params.push(`%${title.trim()}%`);
        conditions.push(`title ILIKE $${params.length}`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // pagination is optional: without page and limit, every matching book is returned
    if (page === undefined && limit === undefined) {
        const { rows } = await query(`SELECT * FROM books ${where} ORDER BY id`, params);
        return res.json(rows);
    }

    const pageNumber = Number(page ?? 1);
    const pageSize = Number(limit ?? 10);

    const { rows: [{ total }] } = await query(`SELECT COUNT(*)::int AS total FROM books ${where}`, params);

    const { rows } = await query(
        `SELECT * FROM books ${where} ORDER BY id LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, pageSize, (pageNumber - 1) * pageSize]
    );

    // the body stays a plain array, the total goes in a header
    res.set('X-Total-Count', String(total));
    res.json(rows);
}

// GET /api/books/:id
async function getBookById(req, res) {
    const { rows } = await query('SELECT * FROM books WHERE id = $1', [req.params.id]);

    if (rows.length === 0) {
        return res.status(404).json({ error: 'Book not found' });
    }

    res.json(rows[0]);
}

// POST /api/books
async function createBook(req, res) {
    const body = req.body ?? {};
    const error = validateBook(body);

    if (error) {
        return res.status(400).json({ error });
    }

    try {
        const { rows } = await query(
            'INSERT INTO books (title, release_date, available, author_id) VALUES ($1, $2, COALESCE($3, true), $4) RETURNING *',
            [body.title.trim(), body.release_date ?? null, body.available ?? null, body.author_id]
        );
        res.status(201).json(rows[0]);

    } catch (err) {
        // 23503 = foreign key violation (author does not exist)
        if (err.code === '23503') {
            return res.status(400).json({ error: 'Author not found' });
        }
        throw err;
    }
}

// PUT /api/books/:id
async function updateBook(req, res) {
    const body = req.body ?? {};
    const error = validateBook(body);

    if (error) {
        return res.status(400).json({ error });
    }

    try {
        // when available is not sent, the current value is kept (it is controlled by the loans)
        const { rows } = await query(
            `UPDATE books
             SET title = $1, release_date = $2, available = COALESCE($3, available), author_id = $4
             WHERE id = $5
             RETURNING *`,
            [body.title.trim(), body.release_date ?? null, body.available ?? null, body.author_id, req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.json(rows[0]);
    } catch (err) {
        if (err.code === '23503') {
            return res.status(400).json({ error: 'Author not found' });
        }
        throw err;
    }
}

// DELETE /api/books/:id
async function deleteBook(req, res) {
    try {
        const { rowCount } = await query('DELETE FROM books WHERE id = $1', [req.params.id]);

        if (rowCount === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.status(204).send();
    } catch (err) {
        // 23503 = foreign key violation (book has loans history)
        if (err.code === '23503') {
            return res.status(409).json({ error: 'Book has loans and cannot be deleted' });
        }
        throw err;
    }
}

export {getBooks, getBookById, createBook, updateBook, deleteBook}
