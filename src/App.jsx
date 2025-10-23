import { RouterProvider } from "react-router-dom";
import router from "./router"; 
import { toast, ToastContainer } from "react-toastify";
import './index.css';
import './App.css';

function App() {
  return (
    <>
    <ToastContainer/>
     <RouterProvider router={router} />;
    </>
  )
}
export default App;


