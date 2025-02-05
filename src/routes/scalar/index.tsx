import { createFileRoute } from "@tanstack/react-router";
import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";

export const Route = createFileRoute("/scalar/")({
  component: RouteComponent,
  notFoundComponent(props) {
    return <div>Failed to load the component.</div>;
  },
});

function RouteComponent() {
  return (
    <ApiReferenceReact
      configuration={{
        withDefaultFonts: false,
        hideClientButton: true,
        // layout: "classic",
        // hideDownloadButton: true,
        hideTestRequestButton: true,
        // defaultHttpClient: { clientKey: "axios", targetKey: "js" },
        defaultOpenAllTags: false,
        // Find out a way to support dynamic routes in tanstack router
        // pathRouting: { basePath: "/scalar" },
        spec: {
          // We can generate the .yaml file and the use javascript file api
          // to construct it, then generate it's url using object url.
          url: "/openapi-spec.yaml",
        },
      }}
    />
  );
}
