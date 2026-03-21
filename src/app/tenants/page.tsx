"use client";

import { useEffect, useMemo, useState } from "react";
import {
  filterInputStyle,
  pageMainStyle,
  pageHeaderStyle,
  pageHeaderActionsStyle,
  secondaryButtonStyle,
  primaryButtonStyle,
} from "@/components/ui/styles";
import TableCard from "@/components/ui/TableCard";

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

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;

    return items.filter((t) => {
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
  }, [items, query]);

  const GRID = "1.6fr 130px 170px 180px 170px 2fr 170px";

  return (
    <main style={pageMainStyle}>
      <div style={pageHeaderStyle}>
        <div>
          <h1 style={{ margin: 0, fontSize: 34 }}>Арендаторы</h1>
          <div style={{ marginTop: 6, fontSize: 13, opacity: 0.7 }}>
            Справочник физических лиц для договоров аренды
          </div>
        </div>

        <div style={pageHeaderActionsStyle}>
          <a href="/contracts" style={secondaryButtonStyle}>
            Договоры
          </a>

          <a href="/tenants/new" style={primaryButtonStyle}>
            + Новый арендатор
          </a>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по ФИО, паспорту, коду подразделения, адресу"
          style={filterInputStyle}
        />
      </div>

      <div style={{ marginTop: 10, fontSize: 12, opacity: 0.65 }}>
        Найдено: {filteredItems.length}
      </div>

      {loading ? (
        <div style={{ marginTop: 16 }}>Загрузка...</div>
      ) : err ? (
        <div style={{ marginTop: 16, color: "crimson" }}>Ошибка: {err}</div>
      ) : (
  <TableCard>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: GRID,
              background: "#f9fafb",
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
            <div>Действия</div>
          </div>

          {filteredItems.length === 0 ? (
            <div style={{ padding: 18, textAlign: "center", opacity: 0.7 }}>
              Арендаторы не найдены.
            </div>
          ) : (
            filteredItems.map((t) => (
              <div
                key={t.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: GRID,
                  padding: "10px 12px",
                  borderTop: "1px solid #f1f5f9",
                  alignItems: "center",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f9fafb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "white";
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

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "nowrap",
                    alignItems: "center",
                  }}
                >
                  <a href={`/tenants/${t.id}`} style={secondaryButtonStyle}>
                    Редактировать
                  </a>
                </div>
              </div>
            ))
          )}
         </TableCard>
      )}
    </main>
  );
}