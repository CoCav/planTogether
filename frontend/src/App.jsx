import AppRouter from "./routes/AppRouter";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ToastContainer from "./components/ui/ToastContainer";

/* ==================================================
   APP
   Defines the global application shell

   Includes:
   - navbar
   - routed page views
   - footer
   - toasts
================================================== */

function App() {
    return (
        <div className="app-layout">
            <Navbar />

            <div className="app-main">
                <AppRouter />
            </div>

            <Footer />

            <ToastContainer />
        </div>
    );
}

export default App;
