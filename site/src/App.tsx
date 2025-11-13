import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { Examples } from './pages/Examples';
import { Playground } from './pages/Playground';
import { Docs } from './pages/Docs';

function RedirectHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle GitHub Pages SPA redirect
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');

    if (redirect) {
      // Remove the redirect parameter and navigate to the intended path
      const url = new URL(window.location.href);
      url.searchParams.delete('redirect');
      window.history.replaceState({}, '', url);
      navigate(redirect, { replace: true });
    }
  }, [navigate]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <RedirectHandler />
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/examples" element={<Examples />} />
            <Route path="/playground" element={<Playground />} />
            <Route path="/docs" element={<Docs />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
