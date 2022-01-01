import fetch from 'node-fetch';

const API = 'https://beta.pokeapi.co/graphql/v1beta';

export function pokeapi_fetch(query: string, variables: any, op: string) {
  const body = JSON.stringify({ query, variables, operationName: op });
  return fetch(API, { method: 'POST', body }).then((res) => res.json());
}

// we *don't* want to parse the query into a DocumentNode or whatever, because
// we're just doing a regular old fetch rather than any fancy apollo stuff.
// but we still want syntax highlighting, and vscode seems to do that for
// any tag named `gql` so
export const gql = String.raw;
