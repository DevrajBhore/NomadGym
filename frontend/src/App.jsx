import { BrowserRouter as Router } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import AppRoutes from "./routes/AppRoutes.jsx"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <main className="app-main-content">
          <AppRoutes />
        </main>
        <Footer />
      </AuthProvider>
    </Router>
  )
}

export default App


