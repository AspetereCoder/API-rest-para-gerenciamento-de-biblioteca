import { MAX_INT } from "../validators/common.js";

// used with router.param('id', validateId): runs before every route that has an :id in its path
function validateId(req, res, next, value) {
    if (!/^[1-9]\d*$/.test(value) || Number(value) > MAX_INT) {
        return res.status(400).json({ error: 'id must be a positive integer' });
    }

    next();
}

export {validateId};
