import { Routes, Route } from "react-router-dom";
import Controller from "./pages/controller";
import sections from "./components/functions/sections";

import Header from "./components/shared/header";

export default function App() {
  return (
    <>
      <div className="min-h-screen bg-dark-1 text-gray-1">
        <Header />
        <Routes>
          {sections.map((section, index) => (
            <Route
              key={index}
              path={section.path}
              element={
                <Controller props={section.component} page={section.title} />
              }
            />
          ))}
        </Routes>
      </div>
    </>
  )
}