CREATE TABLE IF NOT EXISTS authors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    nationality VARCHAR(60)
);

CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    release_date INT,
    available BOOLEAN NOT NULL DEFAULT true,
    author_id INT NOT NULL REFERENCES authors(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS loans (
    id SERIAL PRIMARY KEY,
    book_id INT NOT NULL REFERENCES books(id) ON DELETE RESTRICT,
    borrower_name VARCHAR(120) NOT NULL,
    borrowed_at TIMESTAMP NOT NULL DEFAULT now(),
    due_date DATE NOT NULL,
    returned_at TIMESTAMP
);

