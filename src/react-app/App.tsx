import { BrowserRouter as Router, Routes, Route } from "react-router";
import { DataProvider } from "@/react-app/context/DataContext";
import Layout from "@/react-app/components/Layout";
import HomePage from "@/react-app/pages/Home";
import DashboardPage from "@/react-app/pages/Dashboard";
import LojaPage from "@/react-app/pages/Loja";
import DetalhesPage from "@/react-app/pages/Detalhes";

export default function App() {
  return (
    <DataProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/loja" element={<LojaPage />} />
            <Route path="/detalhes" element={<DetalhesPage />} />
          </Routes>
        </Layout>
      </Router>
    </DataProvider>
  );
}
