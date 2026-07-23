import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { ModelProvider } from './components/shared/ModelContext.jsx'
import 'driver.js/dist/driver.css';

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ModelProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ModelProvider>
  </React.StrictMode>
);
