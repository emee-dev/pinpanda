/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as IndexImport } from './routes/index'
import { Route as ScalarIndexImport } from './routes/scalar/index'

// Create/Update Routes

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const ScalarIndexRoute = ScalarIndexImport.update({
  id: '/scalar/',
  path: '/scalar/',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/scalar/': {
      id: '/scalar/'
      path: '/scalar'
      fullPath: '/scalar'
      preLoaderRoute: typeof ScalarIndexImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/scalar': typeof ScalarIndexRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/scalar': typeof ScalarIndexRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/scalar/': typeof ScalarIndexRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/scalar'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/scalar'
  id: '__root__' | '/' | '/scalar/'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  ScalarIndexRoute: typeof ScalarIndexRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  ScalarIndexRoute: ScalarIndexRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/scalar/"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/scalar/": {
      "filePath": "scalar/index.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
