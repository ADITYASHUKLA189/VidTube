import ApiError from "../utils/ApiError.js"

export const validateRequest = (schema) => (req, res, next) => {
    try {
        if (schema) {
            const dataToValidate = {
                ...req.body,
                ...req.query,
                ...req.params
            }

            const parsed = schema.safeParse(dataToValidate)
            if (!parsed.success) {
                const issues = parsed.error?.errors || parsed.error?.issues || (Array.isArray(parsed.error) ? parsed.error : []);
                const errorMessages = issues
                    .map((err) => `${err.path?.join(".") || 'field'}: ${err.message}`)
                    .join(", ");
                throw new ApiError(400, `Validation failed: ${errorMessages}`, issues);
            }

            // Assign back to body to preserve parsed format
            req.body = { ...req.body, ...parsed.data }
        }
        next()
    } catch (error) {
        next(error)
    }
}
