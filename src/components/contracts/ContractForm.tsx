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
  gender?: "MALE" | "FEMALE" | null;
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

type Company = {
  id: string;
  kind?: "COMPANY" | "IP";
  name: string;
  shortName?: string | null;
  inn?: string | null;
  kpp?: string | null;
  ogrn?: string | null;
  address?: string | null;
  postalAddress?: string | null;
  email?: string | null;
  phone?: string | null;
  bankName?: string | null;
  bankBik?: string | null;
  bankAccount?: string | null;
  correspondentAccount?: string | null;
  directorName?: string | null;
  directorPosition?: string | null;
  directorGender?: "MALE" | "FEMALE" | null;
  directorPositionGenitive?: string | null;
  directorNameGenitive?: string | null;
  basis?: string | null;
};

type ContractFormData = {
  type: "PERSON" | "COMPANY";
  propertyCode: string;
  checkIn: string;
  checkOut: string;
  contractDate?: string;
  actDate?: string;
  invoiceDate?: string;
  pricePerDayRub: number;
  priceRub: number;

  tenantId?: string | null;
  tenantName?: string | null;
  tenantPassport?: string | null;
  tenantAddress?: string | null;

  companyId?: string | null;
  companyKind?: "COMPANY" | "IP" | null;
  companyName?: string | null;
  companyShortName?: string | null;
  companyInn?: string | null;
  companyKpp?: string | null;
  companyOgrn?: string | null;
  companyAddress?: string | null;
  companyPostalAddress?: string | null;
  companyEmail?: string | null;
  companyPhone?: string | null;
  companyBankName?: string | null;
  companyBankBik?: string | null;
  companyBankAccount?: string | null;
  companyCorrespondentAccount?: string | null;
  companyDirectorName?: string | null;
  companyDirectorPosition?: string | null;
  companyDirectorGender?: "MALE" | "FEMALE" | null;
  companyDirectorPositionGenitive?: string | null;
  companyDirectorNameGenitive?: string | null;
  companyBasis?: string | null;
  companyGuestText?: string | null;
};

type ContractFormProps = {
  mode: "create" | "edit";
  contractId?: string;
  initialData?: Partial<ContractFormData>;
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

async function sendJson(url: string, method: "POST" | "PUT", body: any) {
  const r = await fetch(url, {
    method,
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
  if (!isoYmd) return "—";
  const d = new Date(isoYmd + "T00:00:00");
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("ru-RU");
}

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section
    style={{
      border: "1px solid #e5e7eb",
      borderRadius: 16,
      padding: 16,
      background: "white",
      boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
    }}
  >
    <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12, opacity: 0.9 }}>
      {title}
    </div>
    {children}
  </section>
);

const Label = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <span style={{ fontSize: 12, opacity: 0.7 }}>{label}</span>
    {children}
  </label>
);

export default function ContractForm({ mode, contractId, initialData }: ContractFormProps) {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);

  const [type, setType] = useState<"PERSON" | "COMPANY">(initialData?.type ?? "PERSON");
  const [propertyCode, setPropertyCode] = useState<string>(initialData?.propertyCode ?? "");
  const [tenantId, setTenantId] = useState<string>(initialData?.tenantId ?? "");
  const [companyId, setCompanyId] = useState<string>(initialData?.companyId ?? "");
  const [companyKind, setCompanyKind] = useState<"COMPANY" | "IP">(
    initialData?.companyKind ?? "COMPANY"
  );

  const [checkIn, setCheckIn] = useState<string>(initialData?.checkIn ?? toYmd(today));
  const [checkOut, setCheckOut] = useState<string>(initialData?.checkOut ?? toYmd(tomorrow));
  const [contractDate, setContractDate] = useState<string>(
    initialData?.contractDate ?? toYmd(today)
  );
  const [actDate, setActDate] = useState<string>(initialData?.actDate ?? toYmd(today));
  const [invoiceDate, setInvoiceDate] = useState<string>(
    initialData?.invoiceDate ?? toYmd(today)
  );
  const [pricePerDayRub, setPricePerDayRub] = useState<number>(
    initialData?.pricePerDayRub ?? 0
  );

  const [companyName, setCompanyName] = useState<string>(initialData?.companyName ?? "");
  const [companyShortName, setCompanyShortName] = useState<string>(
    initialData?.companyShortName ?? ""
  );
  const [companyInn, setCompanyInn] = useState<string>(initialData?.companyInn ?? "");
  const [companyKpp, setCompanyKpp] = useState<string>(initialData?.companyKpp ?? "");
  const [companyOgrn, setCompanyOgrn] = useState<string>(initialData?.companyOgrn ?? "");
  const [companyAddress, setCompanyAddress] = useState<string>(
    initialData?.companyAddress ?? ""
  );
  const [companyPostalAddress, setCompanyPostalAddress] = useState<string>(
  initialData?.companyPostalAddress ?? ""
);
  const [companyEmail, setCompanyEmail] = useState<string>(initialData?.companyEmail ?? "");
  const [companyPhone, setCompanyPhone] = useState<string>(initialData?.companyPhone ?? "");
  const [companyBankName, setCompanyBankName] = useState<string>(
    initialData?.companyBankName ?? ""
  );
  const [companyBankBik, setCompanyBankBik] = useState<string>(
    initialData?.companyBankBik ?? ""
  );
  const [companyBankAccount, setCompanyBankAccount] = useState<string>(
    initialData?.companyBankAccount ?? ""
  );
  const [companyCorrespondentAccount, setCompanyCorrespondentAccount] = useState<string>(
    initialData?.companyCorrespondentAccount ?? ""
  );
  const [companyDirectorName, setCompanyDirectorName] = useState<string>(
    initialData?.companyDirectorName ?? ""
  );
  const [companyDirectorPosition, setCompanyDirectorPosition] = useState<string>(
    initialData?.companyDirectorPosition ?? "Генеральный директор"
  );
  const [companyDirectorPositionGenitive, setCompanyDirectorPositionGenitive] = useState<string>(
  initialData?.companyDirectorPositionGenitive ?? ""
);
  const [companyDirectorGender, setCompanyDirectorGender] = useState<"MALE" | "FEMALE">(
    initialData?.companyDirectorGender ?? "MALE"
  );
  const [companyDirectorNameGenitive, setCompanyDirectorNameGenitive] = useState<string>(
  initialData?.companyDirectorNameGenitive ?? ""
);
  const [companyBasis, setCompanyBasis] = useState<string>(
    initialData?.companyBasis ?? "Устава"
  );
  const [companyGuestText, setCompanyGuestText] = useState<string>(
  initialData?.companyGuestText ?? ""
);

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

    try {
      const rc = await fetch("/api/companies", { cache: "no-store" });
      if (rc.ok) {
        const data = await rc.json();
        setCompanies(Array.isArray(data) ? data : []);
      }
    } catch {}
  })();
}, []);

  const selectedProperty = useMemo(
    () => properties.find((p) => p.code === propertyCode) ?? null,
    [properties, propertyCode]
  );

  const selectedTenant = useMemo(
    () => tenants.find((t) => t.id === tenantId) ?? null,
    [tenants, tenantId]
  );

  const selectedCompany = useMemo(
    () => companies.find((c) => c.id === companyId) ?? null,
    [companies, companyId]
  );

  useEffect(() => {
    if (type !== "COMPANY") return;
    if (!selectedCompany) return;

    setCompanyKind(selectedCompany.kind ?? "COMPANY");
    setCompanyName(selectedCompany.name ?? "");
    setCompanyShortName(selectedCompany.shortName ?? "");
    setCompanyInn(selectedCompany.inn ?? "");
    setCompanyKpp(selectedCompany.kind === "IP" ? "" : selectedCompany.kpp ?? "");
    setCompanyOgrn(selectedCompany.ogrn ?? "");
    setCompanyAddress(selectedCompany.address ?? "");
    setCompanyPostalAddress(selectedCompany.postalAddress ?? "");
    setCompanyEmail(selectedCompany.email ?? "");
    setCompanyPhone(selectedCompany.phone ?? "");
    setCompanyBankName(selectedCompany.bankName ?? "");
    setCompanyBankBik(selectedCompany.bankBik ?? "");
    setCompanyBankAccount(selectedCompany.bankAccount ?? "");
    setCompanyCorrespondentAccount(selectedCompany.correspondentAccount ?? "");
    setCompanyDirectorName(selectedCompany.directorName ?? "");
    setCompanyDirectorPosition(
      selectedCompany.directorPosition ??
        (selectedCompany.kind === "IP" ? "Индивидуальный предприниматель" : "Генеральный директор")
    );
    setCompanyDirectorPositionGenitive(
  selectedCompany.directorPositionGenitive ??
    (selectedCompany.kind === "IP"
      ? "Индивидуального предпринимателя"
      : "Генерального директора")
);
    setCompanyDirectorGender(selectedCompany.directorGender ?? "MALE");
    setCompanyDirectorNameGenitive(selectedCompany.directorNameGenitive ?? "");
    setCompanyBasis(
      selectedCompany.basis ??
        (selectedCompany.kind === "IP"
          ? "государственной регистрации в качестве индивидуального предпринимателя"
          : "Устава")
    );
  }, [type, selectedCompany]);

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
    if (type === "COMPANY" && !companyId) return false;
    return true;
  }, [propertyCode, checkIn, checkOut, days, pricePerDayRub, type, tenantId, companyId]);

  async function saveContract() {
    setMsg("");

    if (!propertyCode) return setMsg("Выбери объект (квартиру).");
    if (!checkIn || !checkOut) return setMsg("Заполни даты заезда/выезда.");
    if (days <= 0) return setMsg("Дата выезда должна быть позже даты заезда.");
    if (!pricePerDayRub || pricePerDayRub <= 0) return setMsg("Укажи цену за сутки (₽).");
    if (type === "PERSON" && !tenantId) return setMsg("Выбери арендатора (Tenant).");
    if (type === "COMPANY" && !companyId) return setMsg("Выбери юрлицо.");

    const payload: ContractFormData = {
      type,
      propertyCode,
      checkIn,
      checkOut,
      contractDate,
      actDate,
      invoiceDate,
      pricePerDayRub: Math.floor(Number(pricePerDayRub) || 0),
      priceRub: Math.floor(Number(totalRub) || 0),

      tenantId: type === "PERSON" ? tenantId || null : null,
      tenantName: type === "PERSON" ? selectedTenant?.fio ?? null : null,
      tenantPassport:
        type === "PERSON" && selectedTenant
          ? `${selectedTenant.passportSeries ?? ""} ${selectedTenant.passportNumber ?? ""}`.trim() ||
            null
          : null,
      tenantAddress: type === "PERSON" ? selectedTenant?.regAddress ?? null : null,

      companyId: type === "COMPANY" ? companyId || null : null,
      companyKind: type === "COMPANY" ? companyKind : null,
      companyName: type === "COMPANY" ? companyName || null : null,
      companyShortName: type === "COMPANY" ? companyShortName || null : null,
      companyInn: type === "COMPANY" ? companyInn || null : null,
      companyKpp:
        type === "COMPANY"
          ? companyKind === "IP"
            ? null
            : companyKpp || null
          : null,
      companyOgrn: type === "COMPANY" ? companyOgrn || null : null,
      companyAddress: type === "COMPANY" ? companyAddress || null : null,
      companyPostalAddress: type === "COMPANY" ? companyPostalAddress || null : null,
      companyEmail: type === "COMPANY" ? companyEmail || null : null,
      companyPhone: type === "COMPANY" ? companyPhone || null : null,
      companyBankName: type === "COMPANY" ? companyBankName || null : null,
      companyBankBik: type === "COMPANY" ? companyBankBik || null : null,
      companyBankAccount: type === "COMPANY" ? companyBankAccount || null : null,
      companyCorrespondentAccount: type === "COMPANY" ? companyCorrespondentAccount || null : null,
      companyDirectorName: type === "COMPANY" ? companyDirectorName || null : null,
      companyDirectorPosition: type === "COMPANY" ? companyDirectorPosition || null : null,
      companyDirectorPositionGenitive:
  type === "COMPANY" ? companyDirectorPositionGenitive || null : null,
      companyDirectorGender: type === "COMPANY" ? companyDirectorGender || null : null,
      companyDirectorNameGenitive:
  type === "COMPANY" ? companyDirectorNameGenitive || null : null,
      companyBasis: type === "COMPANY" ? companyBasis || null : null,
      companyGuestText: type === "COMPANY" ? companyGuestText.trim() || null : null,
    };

    setSaving(true);

    try {
      if (mode === "create") {
        await sendJson("/api/contracts/create", "POST", payload);
        setMsg("✅ Договор создан. Открываю список…");

        setTimeout(() => {
          window.location.href = "/contracts";
        }, 300);
      } else {
        if (!contractId) throw new Error("Не передан contractId");
        await sendJson(`/api/contracts/${contractId}`, "PUT", payload);
        setMsg("✅ Договор обновлён. Открываю карточку…");

        setTimeout(() => {
          window.location.href = `/contracts/${contractId}`;
        }, 300);
      }
    } catch (e: any) {
      setMsg(`Ошибка: ${e?.message ?? String(e)}`);
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
    <main
      style={{
        padding: 24,
        width: "100%",
        maxWidth: "1800px",
        margin: "0 auto",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 34 }}>
            {mode === "create" ? "Новый договор" : "Редактирование договора"}
          </h1>
          <div style={{ marginTop: 6, fontSize: 13, opacity: 0.7 }}>
            {mode === "create"
              ? "Заполняешь в браузере → выгружаешь DOCX/PDF в списке договоров."
              : "Изменяешь данные договора → сохраняешь → затем генерируешь DOCX/PDF заново."}
          </div>
        </div>

        <a
          href={mode === "create" ? "/contracts" : `/contracts/${contractId}`}
          style={{
            padding: "10px 14px",
            border: "1px solid #ddd",
            borderRadius: 12,
            textDecoration: "none",
            fontWeight: 700,
            background: "white",
          }}
        >
          ← Назад
        </a>
      </div>

      <div
        style={{
          marginTop: 18,
          display: "grid",
          gridTemplateColumns: "4fr 1fr",
          gap: 24,
          alignItems: "start",
        }}
      >
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
                onClick={() => setType("COMPANY")}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid #d1d5db",
                  background: type === "COMPANY" ? "#111827" : "white",
                  color: type === "COMPANY" ? "white" : "#111827",
                  cursor: "pointer",
                  fontWeight: 800,
                }}
              >
                Юрлицо
              </button>
            </div>
          </Card>

          <Card title="2) Объект и сторона договора">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                alignItems: "end",
              }}
            >
              <Label label="Объект (квартира)">
                <select
                  value={propertyCode}
                  onChange={(e) => setPropertyCode(e.target.value)}
                  style={selectStyle}
                >
                  <option value="">— выбрать объект —</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.code}>
                      {p.code}
                      {p.address ? ` — ${p.address}` : ""}
                    </option>
                  ))}
                </select>
              </Label>

              {type === "PERSON" ? (
                <Label label="Арендатор">
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <select
                      value={tenantId}
                      onChange={(e) => setTenantId(e.target.value)}
                      style={{ ...selectStyle, flex: 1, minWidth: 260 }}
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

                    <a
                      href="/tenants"
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
                      Список
                    </a>

                    {tenantId ? (
                      <a
                        href={`/tenants/${tenantId}/edit`}
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
                        Ред.
                      </a>
                    ) : null}
                  </div>
                </Label>
              ) : (
                <Label label="Юрлицо">
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <select
                      value={companyId}
                      onChange={(e) => setCompanyId(e.target.value)}
                      style={{ ...selectStyle, flex: 1, minWidth: 260 }}
                    >
                      <option value="">— выбрать юрлицо —</option>
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                          {c.inn ? ` — ИНН ${c.inn}` : ""}
                        </option>
                      ))}
                    </select>

                    <a
                      href="/companies/new"
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
                      + Новое
                    </a>

                    <a
                      href="/companies"
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
                      Список
                    </a>

                    {companyId ? (
                      <a
                        href={`/companies/${companyId}/edit`}
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
                        Ред.
                      </a>
                    ) : null}
                  </div>
                </Label>
              )}
              <Label label="Работник(и) для проживания (в нужной форме)">
  <textarea
    value={companyGuestText}
    onChange={(e) => setCompanyGuestText(e.target.value)}
    style={{
      minHeight: 90,
      padding: "10px",
      borderRadius: 10,
      border: "1px solid #d1d5db",
      outline: "none",
      resize: "vertical",
    }}
    placeholder="Например: Иванова Ильи Александровича, Петрова Константина Сергеевича"
  />
</Label>
            </div>

            <div
              style={{
                marginTop: 10,
                padding: 12,
                borderRadius: 12,
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6 }}>Подсказка</div>
              <div style={{ fontSize: 13, opacity: 0.8, lineHeight: 1.35 }}>
                Объекты берутся из <b>/api/properties</b>, арендаторы — из <b>/api/tenants</b>,
                юрлица — из <b>/api/companies</b>.
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

              <Label label="Дата договора">
                <input
                  type="date"
                  value={contractDate}
                  onChange={(e) => setContractDate(e.target.value)}
                  style={inputStyle}
                />
              </Label>

              <Label label="Дата акта">
                <input
                  type="date"
                  value={actDate}
                  onChange={(e) => setActDate(e.target.value)}
                  style={inputStyle}
                />
              </Label>

              <Label label="Дата счёта">
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
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
              <div
                style={{
                  padding: 12,
                  borderRadius: 14,
                  border: "1px solid #e5e7eb",
                  background: "white",
                }}
              >
                <div style={{ fontSize: 12, opacity: 0.7 }}>Количество суток</div>
                <div style={{ fontSize: 24, fontWeight: 900, marginTop: 4 }}>{days}</div>
                {checkIn && checkOut && days <= 0 ? (
                  <div style={{ marginTop: 6, fontSize: 12, color: "crimson" }}>
                    Выезд должен быть позже заезда.
                  </div>
                ) : null}
              </div>

              <div
                style={{
                  padding: 12,
                  borderRadius: 14,
                  border: "1px solid #e5e7eb",
                  background: "white",
                }}
              >
                <div style={{ fontSize: 12, opacity: 0.7 }}>Итоговая сумма (в договор)</div>
                <div style={{ fontSize: 24, fontWeight: 900, marginTop: 4 }}>{money(totalRub)} ₽</div>
                <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>
                  = {money(pricePerDayRub)} ₽ × {days} суток
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div style={{ position: "sticky", top: 20, display: "grid", gap: 16 }}>
          <Card title="Предпросмотр данных (что попадёт в договор)">
            <div style={{ fontSize: 13, lineHeight: 1.5 }}>
              <div>
                <b>Тип:</b> {type === "PERSON" ? "Физлицо" : "Юрлицо"}
              </div>

              <div style={{ marginTop: 8 }}>
                <b>Объект:</b> {propertyCode || "—"}
              </div>
              <div style={{ opacity: 0.8 }}>{selectedProperty?.address ?? ""}</div>

              {type === "PERSON" ? (
                <>
                  <div style={{ marginTop: 8 }}>
                    <b>Арендатор:</b> {selectedTenant?.fio ?? "—"}
                  </div>

                  {selectedTenant ? (
                    <div style={{ marginTop: 6, opacity: 0.85 }}>
                      <div>
                        <b>Паспорт:</b>{" "}
                        {[selectedTenant.passportSeries, selectedTenant.passportNumber]
                          .filter(Boolean)
                          .join(" ") || "—"}
                      </div>
                      <div>
                        <b>Регистрация:</b> {selectedTenant.regAddress ?? "—"}
                      </div>
                    </div>
                  ) : null}
                </>
              ) : (
                <>
                  <div style={{ marginTop: 8 }}>
                    <b>{companyKind === "IP" ? "ИП" : "Юрлицо"}:</b> {companyName || "—"}
                  </div>
                  <div style={{ marginTop: 6, opacity: 0.85 }}>
                    <div>
                      <b>{companyKind === "IP" ? "ИНН" : "ИНН / КПП"}:</b>{" "}
                      {companyKind === "IP"
                        ? companyInn || "—"
                        : [companyInn, companyKpp].filter(Boolean).join(" / ") || "—"}
                    </div>
                    <div>
                      <b>{companyKind === "IP" ? "ОГРНИП" : "ОГРН"}:</b> {companyOgrn || "—"}
                    </div>
                    <div>
                      <b>Подписант:</b>{" "}
                      {[companyDirectorPosition, companyDirectorName].filter(Boolean).join(" ") || "—"}
                    </div>
                    <div>
                      <b>Основание:</b> {companyBasis || "—"}
                    </div>
                  </div>
                </>
              )}

              <div style={{ marginTop: 10 }}>
                <b>Срок:</b> {fmtDateForPreview(checkIn)} → {fmtDateForPreview(checkOut)} ({days} суток)
              </div>

              <div style={{ marginTop: 6 }}>
                <b>Дата договора:</b> {fmtDateForPreview(contractDate)}
              </div>
              <div style={{ marginTop: 6 }}>
                <b>Дата акта:</b> {fmtDateForPreview(actDate)}
              </div>
              <div style={{ marginTop: 6 }}>
                <b>Дата счёта:</b> {fmtDateForPreview(invoiceDate)}
              </div>

              <div style={{ marginTop: 6 }}>
                <b>Цена:</b> {money(pricePerDayRub)} ₽/сут, итог {money(totalRub)} ₽
              </div>
            </div>
          </Card>

          <Card title={mode === "create" ? "Создание" : "Сохранение"}>
            <button
              type="button"
              onClick={saveContract}
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
              {saving
                ? mode === "create"
                  ? "Создаю…"
                  : "Сохраняю…"
                : mode === "create"
                  ? "Создать договор"
                  : "Сохранить изменения"}
            </button>

            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75, lineHeight: 1.35 }}>
              {mode === "create" ? (
                <>
                  После создания договор появится в списке. Там же будут кнопки <b>DOCX</b> и{" "}
                  <b>PDF</b>.
                </>
              ) : (
                <>
                  После сохранения можно заново сформировать <b>DOCX</b> и <b>PDF</b> из карточки
                  договора.
                </>
              )}
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