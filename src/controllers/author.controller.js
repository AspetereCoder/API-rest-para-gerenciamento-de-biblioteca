import { query } from "../data/db.js"
import { validateAuthor } from "../validators/author.validator.js";

// GET /api/authors
async function getAuthors(req, res) {
    const { rows } = await query("SELECT * FROM authors ORDER BY id");
    res.json(rows);
}

// GET /api/authors/:id
async function getAuthorById(req, res) {
    const { rows } = await query('SELECT * FROM authors WHERE id = $1', [req.params.id]);

    if (rows.length === 0) {
        return res.status(404).json({ error: 'Author not found' });
    }

    res.json(rows[0]);
}

// GET /api/authors/:id/books
async function getAuthorBooks(req, res) {
    const author = await query('SELECT 1 FROM authors WHERE id = $1', [req.params.id]);

    if (author.rowCount === 0) {
        return res.status(404).json({ error: 'Author not found' });
    }

    const { rows } = await query('SELECT * FROM books WHERE author_id = $1 ORDER BY id', [req.params.id]);
    res.json(rows);
}

// POST /api/authors
async function createAuthor(req, res) {
    const body = req.body ?? {};
    const error = validateAuthor(body);

    if (error) {
        return res.status(400).json({ error });
    }

    const { rows } = await query(
        'INSERT INTO authors (name, nationality) VALUES ($1, $2) RETURNING *',
        [body.name.trim(), body.nationality?.trim() ?? null]
    );

    res.status(201).json(rows[0]);
}

// PUT /api/authors/:id
async function updateAuthor(req, res) {
    const body = req.body ?? {};
    const error = validateAuthor(body);

    if (error) {
        return res.status(400).json({ error });
    }

    const { rows } = await query(
        'UPDATE authors SET name = $1, nationality = $2 WHERE id = $3 RETURNING *',
        [body.name.trim(), body.nationality?.trim() ?? null, req.params.id]
    );

    if (rows.length === 0) {
        return res.status(404).json({ error: 'Author not found' });
    }

    res.json(rows[0]);
}

// DELETE /api/authors/:id
async function deleteAuthor(req, res) {
    try {
        const { rowCount } = await query('DELETE FROM authors WHERE id = $1', [req.params.id]);

        if (rowCount === 0) {
            return res.status(404).json({ error: 'Author not found' });
        }

        res.status(204).send();
    } catch (err) {
        // 23503 = foreign key violation (author still has books)
        if (err.code === '23503') {
            return res.status(409).json({ error: 'Author has books and cannot be deleted' });
        }
        throw err;
    }
}

export {getAuthors, getAuthorById, getAuthorBooks, createAuthor, updateAuthor, deleteAuthor}
