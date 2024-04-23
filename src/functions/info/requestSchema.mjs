import { object, string } from "yup";

const infoSchema = object({
  cookie: string().required(),
});

export default infoSchema;
