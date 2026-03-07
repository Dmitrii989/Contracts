"use client";

import { useEffect, useMemo, useState } from "react";

type Property = {
  id: string;
  code: string;
  address?: string | null;
};

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
  signInitials?: string | null;
  signSurname?: string | null;
};

type CreatePayload = {
  type: "PERSON" | "COMPANY";
  propertyCode: string;
  checkIn: string;
  checkOut: string;
  pricePerDayRub: number;
  priceRub: number;
  tenantId?: string | null;
  tenantName?: string | null;
  tenantPassport?: string | null;
  tenantAddress?: string | null;
};

function toYmd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function daysBetweenISO(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return 0;
  const a = new Date(checkIn + "T00:00:00");
  const b = new Date(checkOut + "T00:00:00");
  const ms = b.getTime() - a.getTime();
  const d = Math.round(ms / (1000 * 60 * 60 * 24));
  return Math.max(0, d);
}

function money(n: number) {
  const v = Math.max(0, Math.floor(Number(n) || 0));
  return v.toLocaleString("ru-RU");
}

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

function fmtDateForPreview(isoYmd: string) {
  const d = new Date(isoYmd + "T00:00:00");
  return d.toLocaleDateString("ru-RU");
}

const Card = ({ title, children }: { title: string; children: any }) => (
    <section
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        padding: 16,
        background: "white",
        boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12, opacity: 0.9 }}>{title}</div>
      {children}
    </section>
  );

  const Label = ({ label, children }: { label: string; children: any }) => (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 12, opacity: 0.7 }}>{label}</span>
      {children}
    </label>
  );
export default function NewContractPage() {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);

  const [type, setType] = useState<"PERSON" | "COMPANY">("PERSON");
  const [propertyCode, setPropertyCode] = useState<string>("");

  const [tenantId, setTenantId] = useState<string>("");
  const [checkIn, setCheckIn] = useState<string>(toYmd(today));
  const [checkOut, setCheckOut] = useState<string>(toYmd(tomorrow));

  const [pricePerDayRub, setPricePerDayRub] = useState<number>(0);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    (async () => {
      setMsg("");

      try {
        const rp = await fetch("/api/properties", { cache: "no-store" });
        if (rp.ok) {
          const data = await rp.json();
          const arr = Array.isArray(data) ? data : [];
          setProperties(arr);

          if (!propertyCode && arr.length > 0) {
            setPropertyCode(arr[0].code);
          }
        }
      } catch {}

      try {
        const rt = await fetch("/api/tenants", { cache: "no-store" });
        if (rt.ok) {
          const data = await rt.json();
          setTenants(Array.isArray(data) ? data : []);
        }
      } catch {}
    })();
  }, [propertyCode]);

  const selectedProperty = useMemo(
    () => properties.find((p) => p.code === propertyCode) ?? null,
    [properties, propertyCode]
  );

  const selectedTenant = useMemo(
    () => tenants.find((t) => t.id === tenantId) ?? null,
    [tenants, tenantId]
  );

  const days = useMemo(() => daysBetweenISO(checkIn, checkOut), [checkIn, checkOut]);

  const totalRub = useMemo(() => {
    const perDay = Math.max(0, Math.floor(Number(pricePerDayRub) || 0));
    return Math.max(0, days * perDay);
  }, [days, pricePerDayRub]);

  const canSave = useMemo(() => {
    if (!propertyCode) return false;
    if (!checkIn || !checkOut) return false;
    if (days <= 0) return false;
    if (!pricePerDayRub || pricePerDayRub <= 0) return false;
    if (type === "PERSON" && !tenantId) return false;
    return true;
  }, [propertyCode, checkIn, checkOut, days, pricePerDayRub, type, tenantId]);

  async function createContract() {
    setMsg("");

    if (!propertyCode) return setMsg("Выбери объект (квартиру).");
    if (!checkIn || !checkOut) return setMsg("Заполни даты заезда/выезда.");
    if (days <= 0) return setMsg("Дата выезда должна быть позже даты заезда.");
    if (!pricePerDayRub || pricePerDayRub <= 0) return setMsg("Укажи цену за сутки (₽).");
    if (type === "PERSON" && !tenantId) return setMsg("Выбери арендатора (Tenant).");

    const payload: CreatePayload = {
      type,
      propertyCode,
      checkIn,
      checkOut,
      pricePerDayRub: Math.floor(Number(pricePerDayRub) || 0),
      priceRub: Math.floor(Number(totalRub) || 0),
      tenantId: tenantId || null,

      tenantName: selectedTenant?.fio ?? null,
      tenantPassport: selectedTenant
        ? `${selectedTenant.passportSeries ?? ""} ${selectedTenant.passportNumber ?? ""}`.trim() || null
        : null,
      tenantAddress: selectedTenant?.regAddress ?? null,
    };

    setSaving(true);
    try {
      await postJson("/api/contracts/create", payload);
      setMsg("✅ Договор создан. Открываю список…");

      setTimeout(() => {
        window.location.href = "/contracts";
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

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    background: "white",
  };

  return (
    <main style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 34 }}>Новый договор</h1>
          <div style={{ marginTop: 6, fontSize: 13, opacity: 0.7 }}>
            Заполняешь в браузере → выгружаешь DOCX/PDF в списке договоров.
          </div>
        </div>

        <a
          href="/contracts"
          style={{
            padding: "10px 14px",
            border: "1px solid #ddd",
            borderRadius: 12,
            textDecoration: "none",
            fontWeight: 700,
            background: "white",
          }}
        >
          ← К списку
        </a>
      </div>

      <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 16 }}>
        <div style={{ display: "grid", gap: 16 }}>
          <Card title="1) Тип договора">
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setType("PERSON")}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid #d1d5db",
                  background: type === "PERSON" ? "#111827" : "white",
                  color: type === "PERSON" ? "white" : "#111827",
                  cursor: "pointer",
                  fontWeight: 800,
                }}
              >
                Физлицо
              </button>

              <button
                type="button"
                disabled
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid #d1d5db",
                  background: "#f3f4f6",
                  color: "#6b7280",
                  cursor: "not-allowed",
                  fontWeight: 800,
                }}
              >
                Юрлицо (позже)
              </button>
            </div>
          </Card>

          <Card title="2) Объект и арендатор">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Label label="Объект (квартира)">
                <select
                  value={propertyCode}
                  onChange={(e) => setPropertyCode(e.target.value)}
                  style={selectStyle}
                >
                  <option value="">— выбрать объект —</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.code}>
                      {p.code}{p.address ? ` — ${p.address}` : ""}
                    </option>
                  ))}
                </select>
              </Label>

              <Label label="Арендатор (Tenant)">
  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
    <select
      value={tenantId}
      onChange={(e) => setTenantId(e.target.value)}
      style={{ ...selectStyle, flex: 1 }}
    >
      <option value="">— выбрать арендатора —</option>
      {tenants.map((t) => (
        <option key={t.id} value={t.id}>
          {t.fio}
          {t.passportSeries || t.passportNumber
            ? ` — ${t.passportSeries ?? ""} ${t.passportNumber ?? ""}`
            : ""}
        </option>
      ))}
    </select>

    <a
      href="/tenants/new"
      target="_blank"
      rel="noreferrer"
      style={{
        height: 38,
        padding: "0 12px",
        borderRadius: 10,
        border: "1px solid #d1d5db",
        background: "white",
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        color: "#111827",
        whiteSpace: "nowrap",
      }}
    >
      + Новый
    </a>
  </div>
</Label>
            </div>

            <div style={{ marginTop: 10, padding: 12, borderRadius: 12, background: "#f9fafb", border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6 }}>Подсказка</div>
              <div style={{ fontSize: 13, opacity: 0.8, lineHeight: 1.35 }}>
                Объекты берутся из <b>/api/properties</b>, арендаторы — из <b>/api/tenants</b>.
              </div>
            </div>
          </Card>

          <Card title="3) Срок и цена">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <Label label="Дата заезда">
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  style={inputStyle}
                />
              </Label>

              <Label label="Дата выезда">
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  style={inputStyle}
                />
              </Label>

              <Label label="Цена за сутки (₽)">
                <input
                  type="number"
                  value={Number(pricePerDayRub || 0)}
                  onChange={(e) => setPricePerDayRub(Number(e.target.value || 0))}
                  min={0}
                  step={1}
                  style={inputStyle}
                />
              </Label>
            </div>

            <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ padding: 12, borderRadius: 14, border: "1px solid #e5e7eb", background: "white" }}>
                <div style={{ fontSize: 12, opacity: 0.7 }}>Количество суток</div>
                <div style={{ fontSize: 24, fontWeight: 900, marginTop: 4 }}>{days}</div>
                {checkIn && checkOut && days <= 0 ? (
                  <div style={{ marginTop: 6, fontSize: 12, color: "crimson" }}>
                    Выезд должен быть позже заезда.
                  </div>
                ) : null}
              </div>

              <div style={{ padding: 12, borderRadius: 14, border: "1px solid #e5e7eb", background: "white" }}>
                <div style={{ fontSize: 12, opacity: 0.7 }}>Итоговая сумма (в договор)</div>
                <div style={{ fontSize: 24, fontWeight: 900, marginTop: 4 }}>
                  {money(totalRub)} ₽
                </div>
                <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>
                  = {money(pricePerDayRub)} ₽ × {days} суток
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          <Card title="Предпросмотр данных (что попадёт в договор)">
            <div style={{ fontSize: 13, lineHeight: 1.5 }}>
              <div><b>Тип:</b> Физлицо</div>
              <div style={{ marginTop: 8 }}><b>Объект:</b> {propertyCode || "—"}</div>
              <div style={{ opacity: 0.8 }}>{selectedProperty?.address ?? ""}</div>

              <div style={{ marginTop: 8 }}><b>Арендатор:</b> {selectedTenant?.fio ?? "—"}</div>

              {selectedTenant ? (
                <div style={{ marginTop: 6, opacity: 0.85 }}>
                  <div>
                    <b>Паспорт:</b>{" "}
                    {[selectedTenant.passportSeries, selectedTenant.passportNumber].filter(Boolean).join(" ") || "—"}
                  </div>
                  <div><b>Регистрация:</b> {selectedTenant.regAddress ?? "—"}</div>
                </div>
              ) : null}

              <div style={{ marginTop: 10 }}>
                <b>Срок:</b> {checkIn ? fmtDateForPreview(checkIn) : "—"} → {checkOut ? fmtDateForPreview(checkOut) : "—"} ({days} суток)
              </div>

              <div style={{ marginTop: 6 }}>
                <b>Цена:</b> {money(pricePerDayRub)} ₽/сут, итог {money(totalRub)} ₽
              </div>
            </div>
          </Card>

          <Card title="Создание">
            <button
              type="button"
              onClick={createContract}
              disabled={saving || !canSave}
              style={{
                height: 44,
                width: "100%",
                borderRadius: 14,
                border: "1px solid #111827",
                background: saving || !canSave ? "#9ca3af" : "#111827",
                color: "white",
                cursor: saving || !canSave ? "not-allowed" : "pointer",
                fontWeight: 900,
                fontSize: 14,
              }}
            >
              {saving ? "Создаю…" : "Создать договор"}
            </button>

            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75, lineHeight: 1.35 }}>
              После создания договор появится в списке. Там же будут кнопки <b>DOCX</b> и <b>PDF</b>.
            </div>

            {msg ? (
              <div
                style={{
                  marginTop: 12,
                  padding: 10,
                  borderRadius: 12,
                  background: msg.startsWith("✅") ? "#ecfdf5" : "#fff7ed",
                  border: "1px solid " + (msg.startsWith("✅") ? "#a7f3d0" : "#fed7aa"),
                  color: msg.startsWith("✅") ? "#065f46" : "#9a3412",
                  fontSize: 13,
                  whiteSpace: "pre-wrap",
                }}
              >
                {msg}
              </div>
            ) : null}
          </Card>
        </div>
      </div>
    </main>
  );
}