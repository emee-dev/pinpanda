// TODO complete later
type Methods = "get" | "post" | "put";
type WormRequest = {
  name: string;
  query: Record<string, string | number | boolean>;
  url: string;
};

type WormRequestSyntax = Record<Methods, WormRequest>;

export const getMethod = (
  toml_json: WormRequestSyntax
): Methods | undefined => {
  let obj = Object.keys(toml_json);

  let first_method = obj.at(0);

  return first_method ? (first_method.toLowerCase() as Methods) : undefined;
};

export const formatQuery = (obj: Record<string, unknown>) => {
  let valid_http_query = [] as string[];

  for (let [k, v] of Object.entries(obj)) {
    valid_http_query.push(`${k}=${v}`);
  }

  return valid_http_query;
};

export const formatTOMl = (toml_json: WormRequestSyntax) => {
  let method = getMethod(toml_json);

  if (!method) {
    return;
  }

  let request = toml_json[method];

  // @ts-expect-error
  request.query = formatQuery(request.query);

  return { [method]: request };
};
