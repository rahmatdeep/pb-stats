import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home"; 
import CenterDashboard from "./pages/CenterDashboard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/center/:centerId",
    element: <CenterDashboard />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
