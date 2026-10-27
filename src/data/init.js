import fs from "node:fs";
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { query } from "./db.js";

// recreating the __dirname variable for the ES Modules syntax
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedAuthors = [
  {
    name: 'Machado de Assis',
    nationality: 'Brasileira',
    books: [
      { title: 'Dom Casmurro', release_date: 1899 },
      { title: 'Memórias Póstumas de Brás Cubas', release_date: 1881 },
    ],
  },
  {
    name: 'Clarice Lispector',
    nationality: 'Brasileira',
    books: [
      { title: 'A Hora da Estrela', release_date: 1977 },
      { title: 'A Paixão Segundo G.H.', release_date: 1964 },
    ],
  },
  {
    name: 'George Orwell',
    nationality: 'Britânica',
    books: [
      { title: '1984', release_date: 1949 },
      { title: 'A Revolução dos Bichos', release_date: 1945 },
    ],
  },
];

// only fills the database when it is empty, so running db:init again won't duplicate data
async function seed() {
  const { rows } = await query('SELECT COUNT(*)::int AS total FROM authors');

  if (rows[0].total > 0) {
    console.log('database already has data, skipping seed');
    return;
  }

  for (const author of seedAuthors) {
    const { rows: [created] } = await query(
      'INSERT INTO authors (name, nationality) VALUES ($1, $2) RETURNING id',
      [author.name, author.nationality]
    );

    for (const book of author.books) {
      await query(
        'INSERT INTO books (title, release_date, author_id) VALUES ($1, $2, $3)',
        [book.title, book.release_date, created.id]
      );
    }
  }

  console.log('database successfully seeded');
}

(async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await query(sql);

    console.log('sql tables successfully created');

    await seed();
    process.exit(0);

  } catch (error) {

    console.error('error while initializing database: ', error);
    process.exit(1);

  }
})();