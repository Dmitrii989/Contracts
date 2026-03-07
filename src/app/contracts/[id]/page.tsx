"use client";

import { useEffect, useState } from "react";

type ContractDetails = {
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
  tenantPassport: string | null;
  tenantBirthDate: string | null;
  tenantPassportIssuedBy: string | null;
  tenantPassportCode: string | null;
  tenantPassportIssuedAt: string | null;
  tenantAddress: string | null;

  createdAt: string;
};

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("ru-RU");
}

function money(n?: number | null) {
  return Number(n || 0).toLocaleString("ru-RU");
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "220px 1fr",
        gap: 12,
        padding: "10px 0",
        borderTop: "1px solid #eee",
      }}
    >
      <div style={{ opacity: 0.7 }}>{label}</div>
      <div>{value || "—"}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        padding: 16,
        background: "white",
        boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>{title}</div>
      {children}
    </section>
  );
}

export default function ContractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [contractId, setContractId] = useState("");
  const [item, setItem] = useState<ContractDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");

        const p = await params;
        const id = String(p?.id ?? "").trim();
        setContractId(id);

        const r = await fetch(`/api/contracts/${id}`, { cache: "no-store" });
        if (!r.ok) {
          const t = await r.text();
          throw new Error(`HTTP ${r.status}: ${t}`);
        }

        const data = await r.json();
        setItem(data);
      } catch (e: any) {
        setErr(e?.message ?? String(e));
        setItem(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [params]);

  return (
    <main style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 34 }}>
            Договор {item?.number ? `№ ${item.number}` : ""}
          </h1>
          <div style={{ marginTop: 6, fontSize: 13, opacity: 0.7 }}>
            Просмотр карточки договора
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <a
            href="/contracts"
            style={{
              padding: "10px 14px",
              border: "1px solid #ddd",
              borderRadius: 10,
              textDecoration: "none",
              fontWeight: 700,
              background: "white",
            }}
          >
            ← К списку
          </a>

          {contractId ? (
            <>
              <a
                href={`/api/contracts/${contractId}/docx`}
                style={{
                  padding: "10px 14px",
                  border: "1px solid #ddd",
                  borderRadius: 10,
                  textDecoration: "none",
                  fontWeight: 700,
                  background: "white",
                }}
              >
                DOCX
              </a>

              <a
                href={`/api/contracts/${contractId}/pdf`}
                style={{
                  padding: "10px 14px",
                  border: "1px solid #ddd",
                  borderRadius: 10,
                  textDecoration: "none",
                  fontWeight: 700,
                  background: "white",
                }}
              >
                PDF
              </a>
            </>
          ) : null}
        </div>
      </div>

      {loading ? (
        <div style={{ marginTop: 16 }}>Загрузка...</div>
      ) : err ? (
        <div style={{ marginTop: 16, color: "crimson" }}>Ошибка: {err}</div>
      ) : !item ? (
        <div style={{ marginTop: 16 }}>Договор не найден.</div>
      ) : (
        <div style={{ marginTop: 18, display: "grid", gap: 16 }}>
          <Card title="Основное">
            <Row label="Номер" value={item.number} />
            <Row label="Тип" value={item.type === "PERSON" ? "Физлицо" : "Юрлицо"} />
            <Row label="Дата создания" value={fmtDate(item.createdAt)} />
          </Card>

          <Card title="Объект">
            <Row label="Код объекта" value={item.propertyCode} />
            <Row label="Адрес" value={item.propertyAddress} />
          </Card>

          <Card title="Срок и сумма">
            <Row label="Заезд" value={fmtDate(item.checkIn)} />
            <Row label="Выезд" value={fmtDate(item.checkOut)} />
            <Row
              label="Цена за сутки"
              value={item.pricePerDayRub ? `${money(item.pricePerDayRub)} ₽` : "—"}
            />
            <Row label="Итоговая сумма" value={`${money(item.priceRub)} ₽`} />
          </Card>

          <Card title="Арендатор">
            <Row label="ФИО" value={item.tenantFio} />
            <Row label="Дата рождения" value={fmtDate(item.tenantBirthDate)} />
            <Row label="Паспорт" value={item.tenantPassport} />
            <Row label="Кем выдан" value={item.tenantPassportIssuedBy} />
            <Row label="Код подразделения" value={item.tenantPassportCode} />
            <Row label="Дата выдачи" value={fmtDate(item.tenantPassportIssuedAt)} />
            <Row label="Адрес регистрации" value={item.tenantAddress} />
          </Card>
        </div>
      )}
    </main>
  );
}