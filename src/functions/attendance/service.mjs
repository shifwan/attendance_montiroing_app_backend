import { URLs } from "./config.mjs";
import { load as cheerioLoad } from "cheerio";
import { spoofedFetch, getDetails } from "./helpers.mjs";
import { KIITSAPUnreachable } from "./errors.mjs";

const getAttendance = async (cookie, year, session) => {
  const attendanceURL = URLs.attendanceURL;

  let { document, postURL, xmlHeaders, postBody } = await getDetails(
    cookie,
    attendanceURL
  );

  let $ = cheerioLoad(document);

  const yearKey = year;
  const sessionKey = $(`[data-itemvalue1=${session}]`).attr("data-itemkey");
  const inputs = $(".lsField__input");
  const yearId = inputs.eq(0).attr("id");
  const sessionId = inputs.eq(1).attr("id");
  const submitId = $(".lsButton").attr("id");

  // second post request (actual attendance)
  postBody.set(
    "SAPEVENTQUEUE",
    `ComboBox_Select~E002Id~E004${yearId}~E005Key~E004${yearKey}~E005ByEnter~E004false~E003~E002ResponseData~E004delta~E005EnqueueCardinality~E004single~E003~E002~E003~E001ComboBox_Select~E002Id~E004${sessionId}~E005Key~E004${sessionKey}~E005ByEnter~E004false~E003~E002ResponseData~E004delta~E005EnqueueCardinality~E004single~E003~E002~E003~E001Button_Press~E002Id~E004${submitId}~E003~E002ResponseData~E004delta~E005ClientAction~E004submit~E003~E002~E003`
  );

  const response = await spoofedFetch(
    postURL,
    xmlHeaders,
    "POST",
    attendanceURL,
    postBody
  ).catch((err) => {
    throw KIITSAPUnreachable;
  });
  document = await response.text();
  // console.log(document.replaceAll("<![CDATA[", "").replaceAll("]]>", ""));

  const attendance = {
    subject: [],
    presentCount: [],
    absentCount: [],
    dayCount: [],
    presentPercent: [],
    faculty: [],
  };

  $ = cheerioLoad(document);

  const subject = $('td[cc = "1"]');
  const presentCount = $('td[cc = "2"]');
  const absentCount = $('td[cc = "3"]');
  const dayCount = $('td[cc = "5"]');
  const presentPercent = $('td[cc = "6"]');
  const faculty = $('td[cc = "8"]');

  subject.toArray().forEach((elem) => {
    attendance.subject.push($(elem).text());
  });
  presentCount.toArray().forEach((elem) => {
    attendance.presentCount.push($(elem).text());
  });
  absentCount.toArray().forEach((elem) => {
    attendance.absentCount.push($(elem).text());
  });
  dayCount.toArray().forEach((elem) => {
    attendance.dayCount.push($(elem).text());
  });
  presentPercent.toArray().forEach((elem) => {
    attendance.presentPercent.push($(elem).text());
  });
  faculty.toArray().forEach((elem) => {
    attendance.faculty.push($(elem).text());
  });

  return attendance;
};

export default getAttendance;
