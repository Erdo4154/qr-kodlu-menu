// ---------------------------------------------------------------
// App.tsx — Sayfa yönlendirmesi + açılışta menüyü backend'den
// (FastAPI) çekme. Menü gelene kadar hiçbir rota render edilmez;
// böylece Header, CategorySection gibi bileşenler boş veriyle
// karşılaşmaz.
// ---------------------------------------------------------------
import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { fetchMenu } from "./store/menuSlice";
import MenuPage from "./pages/MenuPage";
import AdminPage from "./pages/AdminPage";

export default function App() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((s) => s.menu.status);
  const error = useAppSelector((s) => s.menu.error);

  useEffect(() => {
    if (status === "idle") dispatch(fetchMenu());
  }, [status, dispatch]);

  if (status === "loading" || status === "idle") {
    return (
      <div className="boot-screen">
        <div className="boot-card">
          <div className="boot-spinner" aria-hidden="true" />
          <p>Menü yükleniyor…</p>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="boot-screen">
        <div className="boot-card">
          <p className="boot-error-title">Menüye ulaşılamadı!</p>
          <p className="text-muted small">
            {error ?? "Sunucuya bağlanılamadı."} Backend'in çalıştığından emin olun.
          </p>
          <button className="btn btn-add" onClick={() => dispatch(fetchMenu())}>
            Tekrar deneyin
          </button>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<MenuPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}
