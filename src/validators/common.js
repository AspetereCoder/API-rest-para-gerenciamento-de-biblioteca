// largest value a postgres INT column accepts
const MAX_INT = 2147483647;

function isNonEmptyString(value, maxLength) {
    return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= maxLength;
}

function isInt(value) {
    return Number.isInteger(value) && Math.abs(value) <= MAX_INT;
}

function isPositiveInt(value) {
    return isInt(value) && value > 0;
}

// accepts only real dates written as YYYY-MM-DD (rejects things like 2026-02-31)
function isValidDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }

    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

// today as YYYY-MM-DD, comparable with other YYYY-MM-DD strings
function today() {
    return new Date().toISOString().slice(0, 10);
}

export {MAX_INT, isNonEmptyString, isInt, isPositiveInt, isValidDate, today};
