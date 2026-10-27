import { isNonEmptyString, isInt, isPositiveInt } from "./common.js";

const MAX_LIMIT = 100;

function validateBook({ title, release_date, available, author_id }) {
    if (!isNonEmptyString(title, 200)) {
        return 'title is required and must be a non-empty string with up to 200 characters';
    }

    if (!isPositiveInt(author_id)) {
        return 'author_id is required and must be a positive integer';
    }

    if (release_date !== undefined && release_date !== null && !isInt(release_date)) {
        return 'release_date must be an integer (the year)';
    }

    if (available !== undefined && typeof available !== 'boolean') {
        return 'available must be a boolean';
    }

    return null;
}

// query string values always arrive as strings, so they are checked before being parsed
function validateBookQuery({ available, author_id, title, page, limit }) {
    if (available !== undefined && available !== 'true' && available !== 'false') {
        return 'available must be true or false';
    }

    if (author_id !== undefined && !/^[1-9]\d*$/.test(author_id)) {
        return 'author_id must be a positive integer';
    }

    if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
        return 'title must be a non-empty string';
    }

    if (page !== undefined && !/^[1-9]\d*$/.test(page)) {
        return 'page must be a positive integer';
    }

    if (limit !== undefined && (!/^[1-9]\d*$/.test(limit) || Number(limit) > MAX_LIMIT)) {
        return `limit must be an integer between 1 and ${MAX_LIMIT}`;
    }

    return null;
}

export {validateBook, validateBookQuery};
