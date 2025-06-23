import { ToastProvider } from "@heroui/react";
import { HeroUIProvider } from "@heroui/system";
import ReactDOM from "react-dom/client";

import App from "./App.tsx";
import "@/styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <HeroUIProvider>
    <ToastProvider />
    <App />
  </HeroUIProvider>,
);
