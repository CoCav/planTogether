import AppRouter from "./routes/AppRouter";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

/* ==================================================
   APP
   Defines the global application shell

   Includes:
   - navbar
   - routed page views
   - footer
================================================== */

function App() {
    return (
        <div className="app-layout">
            <Navbar />

            <div className="app-main">
                <AppRouter />
            </div>

            <Footer />
        </div>
    );
}

export default App;
