import { object, string, number } from "yup";

const cookieSchema = object({
  username: number().integer().min(1000000).required(),
  password: string().required(),
});

export default cookieSchema;
