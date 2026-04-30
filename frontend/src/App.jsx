import AppRouter from "./routes/AppRouter";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

/* ==================================================
   APP
   Defines the main application layout

   Includes:
   - navbar
   - routed page content
   - footer
================================================== */

function App() {
    return (
        <div className="app-layout">
            <Navbar />

            <main className="app-main">
                <AppRouter />
            </main>

            <Footer />
        </div>
    );
}

export default App;
