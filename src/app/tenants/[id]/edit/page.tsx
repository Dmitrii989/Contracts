"use client";

import { useEffect, useState } from "react";

type Tenant = {
  id: string;
  fio: string;
  gender?: "MALE" | "FEMALE" | null;
  birthDate?: string | null;
  passportSeries?: string | null;
  passportNumber?: string | null;
  passportIssuedBy?: string | null;
  passportCode?: string | null;
  passportIssuedAt?: string | null;
  regAddress?: string | null;
};

function toInputDate(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

async function patchJson(url: string, body: any) {
  const r = await fetch(url, {
    method: "PATCH",
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

export default function EditTenantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [tenantId, setTenantId] = useState("");

  const [fio, setFio] = useState("");
  const [gender, setGender] = useState<"" | "MALE" | "FEMALE">("");
  const [birthDate, setBirthDate] = useState("");
  const [passportSeries, setPassportSeries] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [passportIssuedBy, setPassportIssuedBy] = useState("");
  const [passportCode, setPassportCode] = useState("");
  const [passportIssuedAt, setPassportIssuedAt] = useState("");
  const [regAddress, setRegAddress] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const p = await params;
        const id = String(p?.id ?? "").trim();
        setTenantId(id);

        const r = await fetch(`/api/tenants/${id}`, { cache: "no-store" });
        if (!r.ok) {
          const t = await r.text();
          throw new Error(`HTTP ${r.status}: ${t}`);
        }

        const data: Tenant = await r.json();

        setFio(data.fio || "");
        setGender(data.gender || "");
        setBirthDate(toInputDate(data.birthDate));
        setPassportSeries(data.passportSeries || "");
        setPassportNumber(data.passportNumber || "");
        setPassportIssuedBy(data.passportIssuedBy || "");
        setPassportCode(data.passportCode || "");
        setPassportIssuedAt(toInputDate(data.passportIssuedAt));
        setRegAddress(data.regAddress || "");
      } catch (e: any) {
        setMsg(`Ошибка загрузки: ${e?.message ?? String(e)}`);
      } finally {
        setLoading(false);
      }
    })();
  }, [params]);

  async function saveTenant() {
    setMsg("");

    if (!fio.trim()) {
      setMsg("Укажи ФИО.");
      return;
    }

    setSaving(true);
    try {
      await patchJson(`/api/tenants/${tenantId}`, {
        fio: fio.trim(),
        gender: gender || null,
        birthDate: birthDate || null,
        passportSeries: passportSeries.trim() || null,
        passportNumber: passportNumber.trim() || null,
        passportIssuedBy: passportIssuedBy.trim() || null,
        passportCode: passportCode.trim() || null,
        passportIssuedAt: passportIssuedAt || null,
        regAddress: regAddress.trim() || null,
      });

      setMsg("✅ Арендатор обновлён.");
    } catch (e: any) {
      setMsg(`Ошибка сохранения: ${e?.message ?? String(e)}`);
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
        <h1 style={{ margin: 0, fontSize: 34 }}>Редактировать арендатора</h1>

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
        </div>
      </div>

      {loading ? (
        <div style={{ marginTop: 16 }}>Загрузка...</div>
      ) : (
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
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 12, opacity: 0.7 }}>ФИО</span>
              <input value={fio} onChange={(e) => setFio(e.target.value)} style={inputStyle} />
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 12, opacity: 0.7 }}>Пол</span>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as "" | "MALE" | "FEMALE")}
                style={{ ...inputStyle, background: "white" }}
              >
                <option value="">— выбрать пол —</option>
                <option value="MALE">Мужчина</option>
                <option value="FEMALE">Женщина</option>
              </select>
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 12, opacity: 0.7 }}>Дата рождения</span>
              <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} style={inputStyle} />
            </label>

            <div />

            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 12, opacity: 0.7 }}>Серия паспорта</span>
              <input value={passportSeries} onChange={(e) => setPassportSeries(e.target.value)} style={inputStyle} />
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 12, opacity: 0.7 }}>Номер паспорта</span>
              <input value={passportNumber} onChange={(e) => setPassportNumber(e.target.value)} style={inputStyle} />
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 12, opacity: 0.7 }}>Кем выдан</span>
              <input value={passportIssuedBy} onChange={(e) => setPassportIssuedBy(e.target.value)} style={inputStyle} />
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 12, opacity: 0.7 }}>Код подразделения</span>
              <input value={passportCode} onChange={(e) => setPassportCode(e.target.value)} style={inputStyle} />
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 12, opacity: 0.7 }}>Дата выдачи</span>
              <input type="date" value={passportIssuedAt} onChange={(e) => setPassportIssuedAt(e.target.value)} style={inputStyle} />
            </label>

            <div />
          </div>

          <div style={{ marginTop: 12 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 12, opacity: 0.7 }}>Адрес регистрации</span>
              <textarea value={regAddress} onChange={(e) => setRegAddress(e.target.value)} style={areaStyle} />
            </label>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 16 }}>
            <button
              type="button"
              onClick={saveTenant}
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
              {saving ? "Сохраняю…" : "Сохранить изменения"}
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
      )}
    </main>
  );
}