import { URLs } from "./config.mjs";
import { load as cheerioLoad } from "cheerio";
import { getDetails } from "./helpers.mjs";

const getInfo = async (cookie) => {
  const attendanceURL = URLs.attendanceURL;

  const { document } = await getDetails(cookie, attendanceURL);

  let $ = cheerioLoad(document);

  const info = {
    school: "",
    rollNo: "",
    name: "",
    regNo: "",
    program: "",
    semester: "",
    userImage: "",
  };

  $ = cheerioLoad(document);

  const allTexts = $(".lsTextView");
  const userImage = $("img[ct=IMG]").attr("src");

  info.school = allTexts.eq(0).text();
  info.rollNo = allTexts.eq(1).text();
  info.name = allTexts.eq(2).text();
  info.regNo = allTexts.eq(3).text();
  info.program = allTexts.eq(4).text();
  info.semester = allTexts.eq(5).text();
  info.userImage = userImage;

  return info;
};

export default getInfo;
