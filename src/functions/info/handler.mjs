import { validateResource } from "./middlewares.mjs";
import infoSchema from "./requestSchema.mjs";
import getInfo from "./service.mjs";

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

export const lambdaHandler = async (event, context) => {
  try {
    const body = JSON.parse(event.body);
    await validateResource(infoSchema, body);
    const cookie = body.cookie;
    const info = await getInfo(cookie);
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(info),
    };
  } catch (err) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
