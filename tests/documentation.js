const masterTemplate = {
  openapi: "3.0.0",
  info: {
    title: "Pointograph",
    version: "1.0.0"
  },
  servers: [
    {
      url: "https://api.pointograph.com/_dev"
    },
    {
      url: "https://api.pointograph.com"
    },
    {
      "url": "http://localhost:7701"
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
  return Object.keys(headers)
    .filter(key => !["User-Agent", "Content-Type"].includes(key))
    .map(header => ({
      in: "header",
      name: header,
      schema: getSchema(headers[header])
    }));
};

const getPathParameters = options => {
  const params = options.pathParameters || [];
  return params.map(param => ({
    in: "path",
    name: param.name,
    description: param.description || "",
    schema: getSchema("string"),
    required: true
  }));
};

const getPath = (req, res, options) => {
  return {
    [req.method]: {
      "description": options.description || "",
      "tags": options.tags || [],
      "parameters": [
        ...getHeaderParameters(req.headers),
        ...getPathParameters(options)
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

module.exports.addEndpoint = (res, options = {}) => {
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
    request,
    response,
    options
  });
};

const transformPath = (path, options) => {
  if (options.pathParameters) {
    let pathArray = path.split("/").slice(1).map((segment, index) => {
      const param = options.pathParameters.find(p => p.index === index);
      if (param) {
        return `{${param.name}}`;
      }
      return segment;
    });
    return "/" + pathArray.join("/");
  }
  return path;
};

module.exports.renderDocumentation = (name = "api") => {
  let template = Object.assign({}, masterTemplate);
  for (const endpoint of endpoints) {
    const {
      request, response, options
    } = endpoint;
    const path = transformPath(request.path, options);
    template.paths[path] = {
      ...(template.paths[path] || {}),
      ...getPath(request, response, options)
    };
  }
  require("fs").writeFileSync(`docs/${name}.json`, JSON.stringify(template, undefined, 2), "utf8");
  return template;
};
