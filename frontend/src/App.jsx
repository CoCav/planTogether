import AppRouter from "./routes/AppRouter";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

function App() {
  return (
    <>
      <Navbar />
      <AppRouter />
      <Footer/>
    </>
  );
}

export default App;