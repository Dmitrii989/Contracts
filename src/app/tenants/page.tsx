"use client";

import { useEffect, useState } from "react";

type Tenant = {
  id: string;
  fio: string;
  birthDate?: string | null;
  passportSeries?: string | null;
  passportNumber?: string | null;
  passportIssuedBy?: string | null;
  passportCode?: string | null;
  passportIssuedAt?: string | null;
  regAddress?: string | null;
};

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("ru-RU");
}

export default function TenantsPage() {
  const [items, setItems] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");

        const r = await fetch("/api/tenants", { cache: "no-store" });
        if (!r.ok) {
          const t = await r.text();
          throw new Error(`HTTP ${r.status}: ${t}`);
        }

        const data = await r.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setErr(e?.message ?? String(e));
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
const filteredItems = items.filter((t) => {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const passport = [t.passportSeries, t.passportNumber]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    (t.fio || "").toLowerCase().includes(q) ||
    passport.includes(q) ||
    (t.passportCode || "").toLowerCase().includes(q) ||
    (t.regAddress || "").toLowerCase().includes(q)
  );
});
  return (
    <main style={{ padding: 24, width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 34 }}>Арендаторы</h1>

        <div style={{ display: "flex", gap: 8 }}>
          <a
            href="/contracts/new"
            style={{
              padding: "10px 14px",
              border: "1px solid #ddd",
              borderRadius: 10,
              textDecoration: "none",
              fontWeight: 700,
              background: "white",
            }}
          >
            ← К договору
          </a>

          <a
            href="/tenants/new"
            style={{
              padding: "10px 14px",
              border: "1px solid #ddd",
              borderRadius: 10,
              textDecoration: "none",
              fontWeight: 700,
              background: "white",
            }}
          >
            + Новый арендатор
          </a>
        </div>
      </div>
<div style={{ marginTop: 16 }}>
  <input
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    placeholder="Поиск по ФИО, паспорту, коду подразделения, адресу"
    style={{
      width: "100%",
      maxWidth: 520,
      height: 40,
      padding: "0 12px",
      borderRadius: 10,
      border: "1px solid #d1d5db",
      outline: "none",
      background: "white",
    }}
  />
</div>
      {loading ? (
        <div style={{ marginTop: 16 }}>Загрузка...</div>
      ) : err ? (
        <div style={{ marginTop: 16, color: "crimson" }}>Ошибка: {err}</div>
      ) : (
        <div
          style={{
            marginTop: 16,
            border: "1px solid #eee",
            borderRadius: 12,
            overflowX: "hidden",
            overflowY: "hidden",
            background: "white",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.6fr 130px 170px 180px 170px 2fr",
              background: "#fafafa",
              padding: "10px 12px",
              fontWeight: 700,
            }}
          >
            <div>ФИО</div>
            <div>Дата рождения</div>
            <div>Паспорт</div>
            <div>Код подразделения</div>
            <div>Дата выдачи</div>
            <div>Адрес регистрации</div>
          </div>

          {filteredItems.map((t) => (
  <div
    key={t.id}
    style={{
      display: "grid",
      gridTemplateColumns: "1.6fr 130px 170px 180px 170px 2fr",
      padding: "10px 12px",
      borderTop: "1px solid #eee",
      alignItems: "center",
      transition: "background 0.15s",
      cursor: "default",
    }}
    onMouseEnter={(e) => {
      (e.currentTarget.style.background = "#f9fafb");
    }}
    onMouseLeave={(e) => {
      (e.currentTarget.style.background = "white");
    }}
  >
              <div style={{ fontWeight: 700 }}>{t.fio || "—"}</div>
              <div>{fmtDate(t.birthDate)}</div>
              <div>
                {[t.passportSeries, t.passportNumber].filter(Boolean).join(" ") || "—"}
              </div>
              <div>{t.passportCode || "—"}</div>
              <div>{fmtDate(t.passportIssuedAt)}</div>
              <div>{t.regAddress || "—"}</div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}