import { headers, templates, URLs } from "./config.mjs";
import { load as cheerioLoad } from "cheerio";
import { KIITSAPUnreachable, invalidCookie } from "./errors.mjs";

export const spoofedFetch = async (url, headers, method, referrer, body) => {
  const fetchOptions = {
    credentials: "include",
    headers: headers,
    referrer: referrer,
    body: body,
    method: method,
    mode: "cors",
  };

  // if body or referrer are not provided remove them
  if (!referrer) delete fetchOptions.referrer;
  if (!body) delete fetchOptions.body;

  return fetch(url, fetchOptions);
};

export const getCookiesIfValid = (cookieArr) => {
  // requests with valid cookies always return this cookie
  if (!cookieArr.join("").includes("SAP_SESSIONID_KPE_500=")) {
    throw invalidCookie;
  }
  const cookie1 = cookieArr[0].split(";")[0];
  const cookie2 = cookieArr[1].split(";")[0];
  return { cookie1, cookie2 };
};

export const getDetails = async (cookie, targetURL) => {
  const docHeaders = new Headers(headers.docHeaders);
  const xmlHeaders = new Headers(headers.xmlHeaders);
  const postBody = new URLSearchParams(templates.postBody);
  const baseURL = URLs.baseURL;

  docHeaders.append("Cookie", cookie);

  let response = await spoofedFetch(targetURL, docHeaders, "GET").catch(
    (err) => {
      throw KIITSAPUnreachable;
    }
  );

  const { cookie1, cookie2 } = getCookiesIfValid(
    response.headers.getSetCookie()
  );

  let document = await response.text();
  const $ = cheerioLoad(document);

  // set required cookies, URL and request body
  xmlHeaders.append("Cookie", `${cookie}; ${cookie1}; ${cookie2}`);
  const postURL = baseURL + $("[id=sap.client.SsrClient.form]").attr("action");
  postBody.set("sap-charset", $("#sap-charset").attr("value"));
  postBody.set("sap-wd-secure-id", $("#sap-wd-secure-id").attr("value"));
  postBody.set("fesrAppName", $("#fesrAppName").attr("value"));

  response = await spoofedFetch(
    postURL,
    xmlHeaders,
    "POST",
    targetURL,
    postBody
  ).catch((err) => {
    throw KIITSAPUnreachable;
  });
  document = await response.text();

  return { document, postURL, xmlHeaders, postBody };
};
