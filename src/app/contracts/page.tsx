"use client";

import { useEffect, useMemo, useState } from "react";

type ContractRow = {
  id: string;
  number: string;
  type: "PERSON" | "COMPANY";
  propertyCode: string;
  propertyAddress: string | null;
  checkIn: string;
  checkOut: string;
  pricePerDayRub: number | null;
  priceRub: number;
  tenantId: string | null;
  tenantFio: string | null;
  createdAt: string;
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU");
}

export default function ContractsPage() {
  const [items, setItems] = useState<ContractRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");

        const r = await fetch("/api/contracts/list", { cache: "no-store" });
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

  const GRID = useMemo(
  () => "120px 90px 130px 1.6fr 110px 110px 170px 160px",
  []
);
const filteredItems = items.filter((c) => {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  return (
    (c.number || "").toLowerCase().includes(q) ||
    (c.propertyCode || "").toLowerCase().includes(q) ||
    (c.propertyAddress || "").toLowerCase().includes(q) ||
    (c.tenantFio || "").toLowerCase().includes(q)
  );
});
  return (
    <main style={{ padding: 24, width: "100%", maxWidth: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <h1 style={{ fontSize: 36, margin: 0 }}>Договоры</h1>

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
          + Новый договор
        </a>
      </div>
<div style={{ marginTop: 16 }}>
  <input
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    placeholder="Поиск по номеру, объекту, адресу, арендатору"
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
        <div style={{ marginTop: 16, color: "crimson" }}>
          Ошибка: {err}
        </div>
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
    gridTemplateColumns: GRID,
    gap: 0,
    background: "#fafafa",
    padding: "10px 12px",
    fontWeight: 700,
  }}
>
            <div>Номер</div>
            <div>Тип</div>
            <div>Объект</div>
            <div>Арендатор</div>
            <div>Заезд</div>
            <div>Выезд</div>
            <div>Сумма</div>
            <div>Файлы</div>
          </div>

          {filteredItems.map((c) => (
            <div
  key={c.id}
  style={{
    display: "grid",
    gridTemplateColumns: GRID,
    padding: "10px 12px",
    borderTop: "1px solid #eee",
    alignItems: "center",
  }}
>
              <div style={{ fontWeight: 800 }}>{c.number}</div>

              <div>{c.type === "PERSON" ? "Физик" : "Юрлицо"}</div>

              <div title={c.propertyAddress ?? ""}>{c.propertyCode}</div>

              <div style={{ fontWeight: 600 }}>
                {c.tenantFio ?? "—"}
              </div>

              <div>{fmtDate(c.checkIn)}</div>
              <div>{fmtDate(c.checkOut)}</div>

              <div>
                {Number(c.priceRub || 0).toLocaleString("ru-RU")} ₽
                {c.pricePerDayRub && c.pricePerDayRub > 0 ? (
                  <span style={{ marginLeft: 8, fontSize: 12, opacity: 0.7 }}>
                    ({c.pricePerDayRub.toLocaleString("ru-RU")} ₽/сут)
                  </span>
                ) : null}
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <a
                  href={`/api/contracts/${c.id}/docx`}
                  style={{
                    padding: "6px 10px",
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    textDecoration: "none",
                    fontSize: 13,
                  }}
                >
                  DOCX
                </a>

                <a
                  href={`/api/contracts/${c.id}/pdf`}
                  style={{
                    padding: "6px 10px",
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    textDecoration: "none",
                    fontSize: 13,
                  }}
                >
                  PDF
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}