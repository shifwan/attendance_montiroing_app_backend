export const validateResource = async (resourceSchema, body) => {
  try {
    await resourceSchema.validate(body, { strict: true });
  } catch (e) {
    throw new Error(e.errors.join(", "));
  }
};
