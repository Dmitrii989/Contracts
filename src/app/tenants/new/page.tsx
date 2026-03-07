"use client";

import { useState } from "react";

type Payload = {
  fio: string;
  birthDate?: string | null;
  passportSeries?: string | null;
  passportNumber?: string | null;
  passportIssuedBy?: string | null;
  passportCode?: string | null;
  passportIssuedAt?: string | null;
  regAddress?: string | null;
};

async function postJson(url: string, body: any) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await r.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {}

  if (!r.ok) {
    const details = json ? JSON.stringify(json) : text;
    throw new Error(`HTTP ${r.status}: ${details}`);
  }

  return json ?? { ok: true };
}

const Label = ({ label, children }: { label: string; children: any }) => (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 12, opacity: 0.7 }}>{label}</span>
      {children}
    </label>
  );
export default function NewTenantPage() {
  const [fio, setFio] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [passportSeries, setPassportSeries] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [passportIssuedBy, setPassportIssuedBy] = useState("");
  const [passportCode, setPassportCode] = useState("");
  const [passportIssuedAt, setPassportIssuedAt] = useState("");
  const [regAddress, setRegAddress] = useState("");

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function createTenant() {
    setMsg("");

    if (!fio.trim()) {
      setMsg("Укажи ФИО.");
      return;
    }

    const payload: Payload = {
      fio: fio.trim(),
      birthDate: birthDate || null,
      passportSeries: passportSeries.trim() || null,
      passportNumber: passportNumber.trim() || null,
      passportIssuedBy: passportIssuedBy.trim() || null,
      passportCode: passportCode.trim() || null,
      passportIssuedAt: passportIssuedAt || null,
      regAddress: regAddress.trim() || null,
    };

    setSaving(true);
    try {
      await postJson("/api/tenants", payload);
      setMsg("✅ Арендатор создан. Открываю список…");
      setTimeout(() => {
        window.location.href = "/tenants";
      }, 300);
    } catch (e: any) {
      setMsg(`Ошибка создания: ${e?.message ?? String(e)}`);
    } finally {
      setSaving(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    height: 38,
    padding: "0 10px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    outline: "none",
  };

  const areaStyle: React.CSSProperties = {
    padding: "10px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    outline: "none",
    minHeight: 80,
    resize: "vertical",
  };

  

  return (
    <main style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 34 }}>Новый арендатор</h1>

        <div style={{ display: "flex", gap: 8 }}>
          <a
            href="/tenants"
            style={{
              padding: "10px 14px",
              border: "1px solid #ddd",
              borderRadius: 10,
              textDecoration: "none",
              fontWeight: 700,
              background: "white",
            }}
          >
            ← К арендаторам
          </a>

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
        </div>
      </div>

      <div
        style={{
          marginTop: 18,
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          padding: 16,
          background: "white",
          boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Label label="ФИО">
            <input value={fio} onChange={(e) => setFio(e.target.value)} style={inputStyle} />
          </Label>

          <Label label="Дата рождения">
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              style={inputStyle}
            />
          </Label>

          <Label label="Серия паспорта">
            <input
              value={passportSeries}
              onChange={(e) => setPassportSeries(e.target.value)}
              style={inputStyle}
            />
          </Label>

          <Label label="Номер паспорта">
            <input
              value={passportNumber}
              onChange={(e) => setPassportNumber(e.target.value)}
              style={inputStyle}
            />
          </Label>

          <Label label="Кем выдан">
            <input
              value={passportIssuedBy}
              onChange={(e) => setPassportIssuedBy(e.target.value)}
              style={inputStyle}
            />
          </Label>

          <Label label="Код подразделения">
            <input
              value={passportCode}
              onChange={(e) => setPassportCode(e.target.value)}
              style={inputStyle}
            />
          </Label>

          <Label label="Дата выдачи">
            <input
              type="date"
              value={passportIssuedAt}
              onChange={(e) => setPassportIssuedAt(e.target.value)}
              style={inputStyle}
            />
          </Label>

          <div />
        </div>

        <div style={{ marginTop: 12 }}>
          <Label label="Адрес регистрации">
            <textarea
              value={regAddress}
              onChange={(e) => setRegAddress(e.target.value)}
              style={areaStyle}
            />
          </Label>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 16 }}>
          <button
            type="button"
            onClick={createTenant}
            disabled={saving}
            style={{
              height: 42,
              padding: "0 14px",
              borderRadius: 12,
              border: "1px solid #111827",
              background: saving ? "#9ca3af" : "#111827",
              color: "white",
              cursor: saving ? "not-allowed" : "pointer",
              fontWeight: 800,
            }}
          >
            {saving ? "Сохраняю…" : "Сохранить арендатора"}
          </button>

          {msg ? (
            <div
              style={{
                fontSize: 13,
                whiteSpace: "pre-wrap",
                color: msg.startsWith("✅") ? "#065f46" : "#9a3412",
              }}
            >
              {msg}
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}