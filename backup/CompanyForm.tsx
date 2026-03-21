"use client";

import { useEffect, useState } from "react";

type CompanyFormData = {
  name: string;
  shortName?: string | null;
  inn?: string | null;
  kpp?: string | null;
  ogrn?: string | null;
  address?: string | null;
  email?: string | null;
  phone?: string | null;
  bankName?: string | null;
  bankBik?: string | null;
  bankAccount?: string | null;
  correspondentAccount?: string | null;
  directorName?: string | null;
  directorPosition?: string | null;
  directorGender?: "MALE" | "FEMALE" | null;
  basis?: string | null;
  kind?: "COMPANY" | "IP";
  directorPositionGenitive?: string | null;
directorNameGenitive?: string | null;
};

type CompanyFormProps = {
  mode: "create" | "edit";
  companyId?: string;
  initialData?: Partial<CompanyFormData>;
};

async function sendJson(url: string, method: "POST" | "PUT", body: unknown) {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  let json: any = null;

  try {
    json = text ? JSON.parse(text) : null;
  } catch {}

  if (!response.ok) {
    const details = json ? JSON.stringify(json) : text;
    throw new Error(`HTTP ${response.status}: ${details}`);
  }

  return json ?? { ok: true };
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
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
      <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12, opacity: 0.9 }}>
        {title}
      </div>
      {children}
    </section>
  );
}

function Label({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 12, opacity: 0.7 }}>{label}</span>
      {children}
    </label>
  );
}

export default function CompanyForm({
  mode,
  companyId,
  initialData,
}: CompanyFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [shortName, setShortName] = useState(initialData?.shortName ?? "");
  const [inn, setInn] = useState(initialData?.inn ?? "");
  const [kpp, setKpp] = useState(initialData?.kpp ?? "");
  const [ogrn, setOgrn] = useState(initialData?.ogrn ?? "");
  const [address, setAddress] = useState(initialData?.address ?? "");
  const [postalAddress, setPostalAddress] = useState(initialData?.postalAddress ?? "");
  const [email, setEmail] = useState(initialData?.email ?? "");
  const [phone, setPhone] = useState(initialData?.phone ?? "");
  const [bankName, setBankName] = useState(initialData?.bankName ?? "");
  const [bankBik, setBankBik] = useState(initialData?.bankBik ?? "");
  const [bankAccount, setBankAccount] = useState(initialData?.bankAccount ?? "");
  const [correspondentAccount, setCorrespondentAccount] = useState(
    initialData?.correspondentAccount ?? ""
  );
  const [directorName, setDirectorName] = useState(initialData?.directorName ?? "");
  const [directorPosition, setDirectorPosition] = useState(
    initialData?.directorPosition ?? "Генеральный директор"
  );
  const [directorPositionGenitive, setDirectorPositionGenitive] = useState(
  initialData?.directorPositionGenitive ?? ""
);
  const [directorGender, setDirectorGender] = useState<"MALE" | "FEMALE">(
    initialData?.directorGender ?? "MALE"
  );
  const [directorNameGenitive, setDirectorNameGenitive] = useState(
  initialData?.directorNameGenitive ?? ""
);
  const [basis, setBasis] = useState(initialData?.basis ?? "Устава");
  const [kind, setKind] = useState<"COMPANY" | "IP">(
    initialData?.kind ?? "COMPANY"
  );

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (kind === "IP") {
      if (!initialData?.directorPosition || directorPosition === "Генеральный директор") {
        setDirectorPosition("Индивидуальный предприниматель");
      }
      if (!initialData?.basis || basis === "Устава") {
        setBasis("государственной регистрации в качестве индивидуального предпринимателя");
      }
      if (kpp) {
        setKpp("");
      }
            if (!initialData?.directorPositionGenitive || directorPositionGenitive === "Генерального директора") {
        setDirectorPositionGenitive("Индивидуального предпринимателя");
      }
      if (!initialData?.directorNameGenitive) {
        setDirectorNameGenitive("");
      }
    }

    if (kind === "COMPANY") {
      if (directorPosition === "Индивидуальный предприниматель") {
        setDirectorPosition("Генеральный директор");
      }
      if (basis === "государственной регистрации в качестве индивидуального предпринимателя") {
        setBasis("Устава");
      }
            if (directorPositionGenitive === "Индивидуального предпринимателя") {
        setDirectorPositionGenitive("Генерального директора");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

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

  async function saveCompany() {
    setMsg("");

    if (!name.trim()) {
      setMsg(kind === "IP" ? "Укажи ФИО ИП." : "Укажи наименование юрлица.");
      return;
    }

    const payload = {
      kind,
      name: name.trim(),
      shortName: shortName.trim() || null,
      inn: inn.trim() || null,
      kpp: kind === "COMPANY" ? kpp.trim() || null : null,
      ogrn: ogrn.trim() || null,
      address: address.trim() || null,
      postalAddress: postalAddress.trim() || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
      bankName: bankName.trim() || null,
      bankBik: bankBik.trim() || null,
      bankAccount: bankAccount.trim() || null,
      correspondentAccount: correspondentAccount.trim() || null,
      directorName: directorName.trim() || null,
      directorPosition: directorPosition.trim() || null,
      directorPositionGenitive: directorPositionGenitive.trim() || null,
      directorGender: directorGender || null,
      directorNameGenitive: directorNameGenitive.trim() || null,
      basis: basis.trim() || null,
    };

    setSaving(true);

    try {
      if (mode === "create") {
        await sendJson("/api/companies", "POST", payload);
        setMsg("✅ Контрагент создан. Открываю список…");

        setTimeout(() => {
          window.location.href = "/companies";
        }, 300);
      } else {
        if (!companyId) {
          throw new Error("Не передан companyId");
        }

        await sendJson(`/api/companies/${companyId}`, "PUT", payload);
        setMsg("✅ Контрагент сохранён. Открываю список…");

        setTimeout(() => {
          window.location.href = "/companies";
        }, 300);
      }
    } catch (e: any) {
      setMsg(`Ошибка: ${e?.message ?? String(e)}`);
    } finally {
      setSaving(false);
    }
  }

  const pageTitle =
    mode === "create"
      ? kind === "IP"
        ? "Новый ИП"
        : "Новое юрлицо"
      : kind === "IP"
        ? "Редактирование ИП"
        : "Редактирование юрлица";

  const pageSubtitle =
    kind === "IP"
      ? "Карточка индивидуального предпринимателя для договоров."
      : "Карточка контрагента для договоров по юрлицу.";

  const mainNameLabel = kind === "IP" ? "ФИО ИП" : "Полное наименование";
  const shortNameLabel = kind === "IP" ? "Краткое наименование (если нужно)" : "Краткое наименование";
  const ogrnLabel = kind === "IP" ? "ОГРНИП" : "ОГРН";
  const signerNameLabel = kind === "IP" ? "ФИО ИП" : "ФИО подписанта";
  const signerPositionLabel = kind === "IP" ? "Статус" : "Должность";
  const basisLabel = kind === "IP" ? "Основание" : "Основание полномочий";

  return (
    <main style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 34 }}>{pageTitle}</h1>
          <div style={{ marginTop: 6, fontSize: 13, opacity: 0.7 }}>
            {pageSubtitle}
          </div>
        </div>

        <a
          href="/companies"
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

      <div style={{ marginTop: 18, display: "grid", gap: 16 }}>
        <Card title="Основные данные">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Label label="Тип">
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value as "COMPANY" | "IP")}
                style={selectStyle}
              >
                <option value="COMPANY">Юрлицо (ООО, АО и т.д.)</option>
                <option value="IP">ИП</option>
              </select>
            </Label>

            <div />

            <Label label={mainNameLabel}>
              <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
            </Label>

            <Label label={shortNameLabel}>
              <input
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                style={inputStyle}
              />
            </Label>

            <Label label="ИНН">
              <input value={inn} onChange={(e) => setInn(e.target.value)} style={inputStyle} />
            </Label>

            {kind === "COMPANY" ? (
              <Label label="КПП">
                <input value={kpp} onChange={(e) => setKpp(e.target.value)} style={inputStyle} />
              </Label>
            ) : (
              <div />
            )}

            <Label label={ogrnLabel}>
              <input value={ogrn} onChange={(e) => setOgrn(e.target.value)} style={inputStyle} />
            </Label>

            <Label label="Телефон">
              <input value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
            </Label>

            <Label label="Email">
              <input value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
            </Label>

            <Label label="Юридический адрес">
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={inputStyle}
              />
            </Label>
            <Label label="Почтовый адрес">
  <input
    value={postalAddress}
    onChange={(e) => setPostalAddress(e.target.value)}
    style={inputStyle}
  />
</Label>
          </div>
        </Card>

        <Card title="Банковские реквизиты">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Label label="Банк">
              <input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                style={inputStyle}
              />
            </Label>

            <Label label="БИК">
              <input
                value={bankBik}
                onChange={(e) => setBankBik(e.target.value)}
                style={inputStyle}
              />
            </Label>

            <Label label="Расчётный счёт">
              <input
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                style={inputStyle}
              />
            </Label>

            <Label label="Корреспондентский счёт">
              <input
                value={correspondentAccount}
                onChange={(e) => setCorrespondentAccount(e.target.value)}
                style={inputStyle}
              />
            </Label>
          </div>
        </Card>

        <Card title={kind === "IP" ? "Данные ИП" : "Подписант"}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Label label={signerNameLabel}>
              <input
                value={directorName}
                onChange={(e) => setDirectorName(e.target.value)}
                style={inputStyle}
              />
            </Label>

            <Label label={signerPositionLabel}>
              <input
                value={directorPosition}
                onChange={(e) => setDirectorPosition(e.target.value)}
                style={inputStyle}
              />
            </Label>
            <Label label="Должность (в родительном падеже)">
  <input
    value={directorPositionGenitive}
    onChange={(e) => setDirectorPositionGenitive(e.target.value)}
    style={inputStyle}
  />
</Label>

            <Label label="Пол подписанта">
              <select
                value={directorGender}
                onChange={(e) => setDirectorGender(e.target.value as "MALE" | "FEMALE")}
                style={selectStyle}
              >
                <option value="MALE">Мужской</option>
                <option value="FEMALE">Женский</option>
              </select>
            </Label>
            <Label label="ФИО (в родительном падеже)">
  <input
    value={directorNameGenitive}
    onChange={(e) => setDirectorNameGenitive(e.target.value)}
    style={inputStyle}
  />
</Label>

            <Label label={basisLabel}>
              <input value={basis} onChange={(e) => setBasis(e.target.value)} style={inputStyle} />
            </Label>
          </div>
        </Card>

        <Card title={mode === "create" ? "Создание" : "Сохранение"}>
          <button
            type="button"
            onClick={saveCompany}
            disabled={saving}
            style={{
              height: 44,
              width: "100%",
              borderRadius: 14,
              border: "1px solid #111827",
              background: saving ? "#9ca3af" : "#111827",
              color: "white",
              cursor: saving ? "not-allowed" : "pointer",
              fontWeight: 900,
              fontSize: 14,
            }}
          >
            {saving
              ? mode === "create"
                ? "Создаю…"
                : "Сохраняю…"
              : mode === "create"
                ? kind === "IP"
                  ? "Создать ИП"
                  : "Создать юрлицо"
                : "Сохранить изменения"}
          </button>

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
    </main>
  );
}