import { isNonEmptyString } from "./common.js";

// every validator returns an error message, or null when the data is valid
function validateAuthor({ name, nationality }) {
    if (!isNonEmptyString(name, 120)) {
        return 'name is required and must be a non-empty string with up to 120 characters';
    }

    if (nationality !== undefined && nationality !== null && !isNonEmptyString(nationality, 60)) {
        return 'nationality must be a non-empty string with up to 60 characters';
    }

    return null;
}

export {validateAuthor};
