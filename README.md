# MediaWiki SDK

[![npm downloads](https://img.shields.io/npm/dm/mediawiki-sdk.svg)](https://www.npmjs.com/package/mediawiki-sdk)
[![npm version](https://img.shields.io/npm/v/mediawiki-sdk.svg)](https://www.npmjs.com/package/mediawiki-sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-Built_with-blue.svg)](https://www.typescriptlang.org/)
[![Bundle size](https://badgen.net/bundlephobia/minzip/mediawiki-sdk)](https://bundlephobia.com/result?p=mediawiki-sdk)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)
[![ESM in browser](https://img.shields.io/badge/browser-support-green.svg)](https://www.jsdelivr.com/package/npm/mediawiki-sdk)

**MediaWiki SDK** is a Node.js SDK, written in TypeScript, for interacting with the MediaWiki API. It provides methods to interface with MediaWiki-based platforms (such as Wikipedia, Wikidata, Fandom) and supports both JavaScript and TypeScript projects.

## Features

*   **Detailed Page Information**: Fetch comprehensive data for pages, including content (`extracts`), categories, revisions, links, and associated metadata.
*   **User Authentication**: Supports logging into MediaWiki sites, including handling for bot passwords.
*   **Flexible Querying**: Execute `action=query` requests using `prop`, `list`, and `meta` parameters for specific data retrieval needs.
*   **Search Functionality**: Offers methods for full-text search (`list=search`) and OpenSearch (autocomplete-style) queries.
*   **Wikitext Parsing**: Convert wikitext to HTML or retrieve structured data from page content via the `action=parse` API.
*   **Site Metadata Retrieval**: Access general information and configuration of a MediaWiki site.
*   **Strongly Typed with TypeScript**: Full static typing provides a robust development experience with autocompletion and compile-time error checking. Response objects are strictly typed.
*   **Promise-based Asynchronous API**: Designed with `async/await` in mind for clean and modern asynchronous code.

## Installation

Ensure you have Node.js version 16 or higher installed.

Install using npm:
```bash
npm install mediawiki-sdk
```

Or using yarn:
```bash
yarn add mediawiki-sdk
```

## Build / Development

If you want to build from source:

```bash
git clone https://github.com/DimaYastrebov/mediawiki-sdk.git
cd mediawiki-sdk
npm install      # install dependencies
npm run build    # compile TypeScript to JavaScript
```