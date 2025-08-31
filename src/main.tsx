import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { TenantProvider, useTenant } from "./context/TenantContext";
import { BrandingProvider } from "./contexts/BrandingContext";
import { AccessControlProvider } from "./contexts/AccessControlContext";
import App from "./App.tsx";
import "./index.css";


const Providers: React.FC = () => {
  const tenantState = useTenant() as any;

  const tenantId =
    tenantState?.tenantId ??
    tenantState?.primaryTenantId ??
    tenantState?.tenant?.id ??
    null;

  const locationId =
    tenantState?.locationId ??
    tenantState?.location?.id ??
    null;

  const currentUserId =
    tenantState?.currentUserId ??
    tenantState?.userId ??
    tenantState?.user?.id ??
    null;

  return (
    <BrandingProvider tenantId={tenantId} locationId={locationId}>
      <AccessControlProvider
        tenantId={tenantId}
        locationId={locationId}
        currentUserId={currentUserId}
      >
        <App />
      </AccessControlProvider>
    </BrandingProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <TenantProvider>
        <Providers />
      </TenantProvider>
    </BrowserRouter>
  </React.StrictMode>
);
