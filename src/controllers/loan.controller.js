import { query } from "../data/db.js"
import { validateLoan } from "../validators/loan.validator.js";

// GET /api/loans?active=true
async function getLoans(req, res) {
    const { active } = req.query;

    if (active !== undefined && active !== 'true' && active !== 'false') {
        return res.status(400).json({ error: 'active must be true or false' });
    }

    const { rows } = await query(
        `SELECT * FROM loans
         ${active === 'true' ? 'WHERE returned_at IS NULL' : ''}
         ORDER BY id`
    );

    res.json(rows);
}

// GET /api/loans/:id
async function getLoanById(req, res) {
    const { rows } = await query('SELECT * FROM loans WHERE id = $1', [req.params.id]);

    if (rows.length === 0) {
        return res.status(404).json({ error: 'Loan not found' });
    }

    res.json(rows[0]);
}

// POST /api/loans
async function createLoan(req, res) {
    const body = req.body ?? {};
    const error = validateLoan(body);

    if (error) {
        return res.status(400).json({ error });
    }

    // marks the book as unavailable and creates the loan in a single statement,
    // so two simultaneous requests can't borrow the same book
    const { rows } = await query(
        `WITH borrowed AS (
             UPDATE books SET available = false
             WHERE id = $1 AND available = true
             RETURNING id
         )
         INSERT INTO loans (book_id, borrower_name, due_date)
         SELECT id, $2, COALESCE($3::date, CURRENT_DATE + 14) FROM borrowed
         RETURNING *`,
        [body.book_id, body.borrower_name.trim(), body.due_date ?? null]
    );

    if (rows.length === 0) {
        const { rowCount } = await query('SELECT 1 FROM books WHERE id = $1', [body.book_id]);

        if (rowCount === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }

        return res.status(409).json({ error: 'Book is not available' });
    }

    res.status(201).json(rows[0]);
}

// POST /api/loans/:id/return
async function returnLoan(req, res) {
    // closes the loan and makes the book available again in a single statement
    const { rows } = await query(
        `WITH returned AS (
             UPDATE loans SET returned_at = now()
             WHERE id = $1 AND returned_at IS NULL
             RETURNING *
         ), freed AS (
             UPDATE books SET available = true
             WHERE id = (SELECT book_id FROM returned)
         )
         SELECT * FROM returned`,
        [req.params.id]
    );

    if (rows.length === 0) {
        const { rowCount } = await query('SELECT 1 FROM loans WHERE id = $1', [req.params.id]);

        if (rowCount === 0) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        return res.status(409).json({ error: 'Loan was already returned' });
    }

    res.json(rows[0]);
}

export {getLoans, getLoanById, createLoan, returnLoan}
