// express recognizes an error handler by its 4 parameters, so `next` must stay even if unused
function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }

    // malformed JSON in the request body
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'Invalid JSON body' });
    }

    // postgres error codes
    switch (err.code) {
        case '22P02': // invalid text representation (e.g. an id or value with the wrong format)
            return res.status(400).json({ error: 'Invalid value format' });

        case '22007': // invalid datetime format
        case '22008': // datetime field overflow
            return res.status(400).json({ error: 'Invalid date' });

        case '23503': // foreign key violation (fallback, controllers handle the common cases)
            return res.status(409).json({ error: 'Operation conflicts with a related record' });
    }

    // anything else is unexpected: log it, but never send the stack trace to the client
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
}

export {errorHandler};
