# API Documentation

This folder contains the generated API documentation for the Alusoft Training
backend.

| File | Description |
|---|---|
| `postman-collection.json` | Postman Collection v2.1 covering **all 51** routes of the API. |
| `API-REFERENCE.md` | Markdown reference generated from the same source of truth. |
| `generate-postman-collection.js` | The generator that produces both files. |
| `check-route-coverage.js` | Verifies the collection matches the routes in `routes/`. |
| `postman/builder.js` | Helpers that turn a declarative endpoint into a Postman item. |
| `postman/endpoints/*.data.js` | One file per resource, describing each endpoint. |

## Usage

```bash
npm run docs:generate   # regenerate postman-collection.json + API-REFERENCE.md
npm run docs:check      # verify the collection still matches routes/
```

Both scripts are plain Node (CommonJS) and need no extra dependencies.

## How the documentation is produced

The endpoint descriptions in `postman/endpoints/*.data.js` are the single
source of truth. Each entry declares the method, path, auth mode, description,
query parameters, request body, saved example responses and optional Postman
test script.

The generator turns those declarations into:

- a Postman Collection v2.1 file with `baseUrl` and `token` collection
  variables, collection-level bearer auth and `noauth` on public routes;
- a Markdown reference with a quick-reference table, the authentication
  matrix, per-endpoint detail and a "Known Implementation Quirks" appendix.

The output is deterministic - regenerating without changing the endpoint
descriptions produces byte-identical files.

## Keeping it in sync

`check-route-coverage.js` parses `routes/*.route.js` and fails if:

- a registered route is missing from the collection;
- a route appears more than once;
- the collection documents a route that does not exist;
- a route is marked `noauth` although it runs `authenticate` (or vice versa);
- an item is missing its description or saved responses.

Run it in CI after any change to `routes/`.

## Importing into Postman

1. Import `postman-collection.json` (File > Import).
2. Set the `baseUrl` variable to your server, e.g. `http://localhost:3000`.
3. Run **Auth > Login** - its test script stores the JWT in the `token`
   variable, which every protected request sends as
   `Authorization: Bearer {{token}}`.
