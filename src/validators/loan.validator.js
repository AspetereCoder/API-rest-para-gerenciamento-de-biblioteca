import { isNonEmptyString, isPositiveInt, isValidDate, today } from "./common.js";

function validateLoan({ book_id, borrower_name, due_date }) {
    if (!isPositiveInt(book_id)) {
        return 'book_id is required and must be a positive integer';
    }

    if (!isNonEmptyString(borrower_name, 120)) {
        return 'borrower_name is required and must be a non-empty string with up to 120 characters';
    }

    if (due_date !== undefined && due_date !== null) {
        if (!isValidDate(due_date)) {
            return 'due_date must be a valid date in the format YYYY-MM-DD';
        }

        if (due_date < today()) {
            return 'due_date cannot be in the past';
        }
    }

    return null;
}

export {validateLoan};
