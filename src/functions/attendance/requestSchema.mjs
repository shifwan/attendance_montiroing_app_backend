import { object, string, number, mixed } from "yup";

const currentYear = new Date().getFullYear();
const attendanceSchema = object({
  cookie: string().required(),
  year: number()
    .integer()
    .min(currentYear - 4)
    .max(currentYear)
    .required(),
  session: mixed().oneOf(["Spring", "Autumn"]).required(),
});

export default attendanceSchema;
