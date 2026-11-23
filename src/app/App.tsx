import { useEffect, useRef, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { ScrollTrigger } from '@/motion/gsap';
import { entrance } from '@/motion/entrance';
import { PageTransition } from '@/motion/transitions/PageTransition';
import { AppStateProvider } from './store';
import { LenisProvider } from './LenisProvider';
import { scrollToHash } from './lenis';
import { Header } from '@/components/Header';
import { Menu } from '@/components/Menu';
import { CursorDot } from '@/components/CursorDot';
import { checkTrustDebug } from '@/data/trust';
import { Preloader, shouldShowPreloader } from '@/components/Preloader';
import { ImageDebugOverlay } from '@/components/ImageDebugOverlay';
import Home from '@/pages/Home';
import Services from '@/pages/Services';
import Approach from '@/pages/Approach';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Privacy from '@/pages/Privacy';
import NotFound from '@/pages/NotFound';

/** Waits for web fonts (max 1.2s) so SplitText measures the real typefaces. */
function useFontsReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let done = false;
    const go = () => {
      if (!done) {
        done = true;
        setReady(true);
      }
    };
    const t = window.setTimeout(go, 1200);
    document.fonts?.ready.then(go).catch(go);
    return () => clearTimeout(t);
  }, []);
  return ready;
}

function Shell() {
  const location = useLocation();
  const [preload, setPreload] = useState(shouldShowPreloader);
  const booted = useRef(false);

  // First paint: refresh triggers, honour a deep-linked anchor, start the hero (unless the preloader will).
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    entrance.reset();
    checkTrustDebug();
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        if (location.hash) {
          // Let the hero settle; anchors land after Lenis and ScrollTrigger initialise.
          window.setTimeout(() => scrollToHash(location.hash, true), 60);
        }
        if (!preload) entrance.fire();
      }),
    );
    // Fonts swapping later would shift line splits; refresh once more when they settle.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dev guard: no duplicate ScrollTriggers after navigation.
  useEffect(() => {
    if (import.meta.env.DEV) {
      const t = window.setTimeout(() => console.debug('[MERES] ScrollTriggers:', ScrollTrigger.getAll().length), 1500);
      return () => clearTimeout(t);
    }
  }, [location.pathname]);

  // Handle hash scrolling on route navigation or hash updates
  useEffect(() => {
    if (location.hash) {
      window.setTimeout(() => scrollToHash(location.hash), 80);
    }
  }, [location.pathname, location.hash]);

  return (
    <>
      <a href="#main" className="skip-link" onClick={(e) => {
        e.preventDefault();
        const m = document.getElementById('main');
        m?.focus();
        m?.scrollIntoView();
      }}>
        Skip to content
      </a>
      <Header />
      <Menu />
      <PageTransition>
        {(loc) => (
          <Routes location={loc}>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/approach" element={<Approach />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        )}
      </PageTransition>
      <CursorDot />
      <ImageDebugOverlay />
      {preload && (
        <Preloader
          onDone={() => {
            setPreload(false);
            ScrollTrigger.refresh();
          }}
        />
      )}
      <div className="grain" aria-hidden="true" />
    </>
  );
}

export default function App() {
  const ready = useFontsReady();
  return (
    <AppStateProvider>
      <LenisProvider>{ready ? <Shell /> : <div className="fixed inset-0 bg-linen" aria-hidden="true" />}</LenisProvider>
    </AppStateProvider>
  );
}
