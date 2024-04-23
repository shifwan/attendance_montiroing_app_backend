import { URLs, headers } from "./config.mjs";
import { load as cheerioLoad } from "cheerio";
import { spoofedFetch } from "./helpers.mjs";
import { invalidUsernamePassword } from "./errors.mjs";

const getCookie = async (username, password) => {
  const loginURL = URLs.loginURL;
  const docHeaders = headers.docHeaders;
  const formHeaders = headers.formHeaders;

  let response = await spoofedFetch(loginURL, docHeaders, "GET").catch(
    (err) => {
      throw KIITSAPUnreachable;
    }
  );

  const document = await response.text();
  const $ = cheerioLoad(document);

  const loginDetails = new URLSearchParams({
    // "login_submit": "on",
    login_do_redirect: "1",
    j_salt: $("[name=j_salt]").attr("value"),
    j_username: username,
    j_password: password,
    uidPasswordLogon: "Log+On",
  });

  response = await spoofedFetch(
    loginURL,
    formHeaders,
    "POST",
    loginURL,
    loginDetails
  ).catch((err) => {
    throw KIITSAPUnreachable;
  });

  if (!response.headers.getSetCookie().join("").includes("MYSAPSSO2=")) {
    throw invalidUsernamePassword;
  }

  const cookie = response.headers.getSetCookie()[0].split(";")[0];

  return { cookie: cookie };
};

export default getCookie;
