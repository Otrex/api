const masterTemplate = {
  openapi: "3.0.0",
  info: {
    title: "Pointograph",
    version: "1.0.0"
  },
  servers: [
    {
      url: "https://api.pointograph.com"
    },
    {
      url: "https://api.pointograph.com/_dev"
    }
  ],
  paths: {}
};

const getSchema = variable => {
  if (variable == null) {
    return {};
  }
  switch (typeof variable) {
  case "string":
    return { type: "string" };
  case "number":
    return { type: "number" };
  case "object":
    if (Array.isArray(variable)) {
      return {
        type: "array",
        items: getSchema(variable[0])
      };
    }
    const schema = {
      type: "object",
      properties: {}
    };
    for (const [key, value] of Object.entries(variable)) {
      schema.properties[key] = getSchema(value);
    }
    return schema;
  }
};

const getHeaderParameters = headers => {
  return Object.keys(headers).filter(key => !["User-Agent", "Content-Type"].includes(key)).map(header => ({
    in: "header",
    name: header,
    schema: getSchema(headers[header])
  }));
};

const getPath = (req, res) => {
  return {
    [req.method]: {
      "description": "",
      "parameters": [
        ...getHeaderParameters(req.headers)
      ],
      ...(req.body ? {
        "requestBody": {
          "content": {
            "application/json": {
              "schema": getSchema(req.body),
              "example": req.body
            }
          }
        },
      } : {}),
      "responses": {
        "200": {
          "description": "",
          "content": {
            "application/json": {
              "schema": getSchema(res.body),
              "example": res.body
            }
          }
        }
      }
    }
  };
};

const endpoints = [];

module.exports.addEndpoint = (res) => {
  const request = {
    method: res.request.method.toLowerCase(),
    path: res.res.req.path,
    headers: res.request.header,
    body: res.request._data || null
  };
  const response = {
    body: res.body
  };
  endpoints.push({
    request, response
  });
};

module.exports.renderDocumentation = (name = "api") => {
  let template = Object.assign({}, masterTemplate);
  for (const endpoint of endpoints) {
    const {
      request, response
    } = endpoint;
    template.paths[request.path] = {
      ...(template.paths[request.path] || {}),
      ...getPath(request, response)
    };
  }
  require("fs").writeFileSync(`docs/${name}.json`, JSON.stringify(template, undefined, 2), "utf8");
  return template;
};
