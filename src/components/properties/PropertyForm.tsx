"use client";

import { useState } from "react";

type PropertyFormData = {
  code: string;
  name?: string | null;
  address?: string | null;
  description?: string | null;
  isActive?: boolean;
};

type PropertyFormProps = {
  mode: "create" | "edit";
  propertyId?: string;
  initialData?: Partial<PropertyFormData>;
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

export default function PropertyForm({
  mode,
  propertyId,
  initialData,
}: PropertyFormProps) {
  const [code, setCode] = useState(initialData?.code ?? "");
  const [name, setName] = useState(initialData?.name ?? "");
  const [address, setAddress] = useState(initialData?.address ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const inputStyle: React.CSSProperties = {
    height: 38,
    padding: "0 10px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    outline: "none",
  };

  const textareaStyle: React.CSSProperties = {
    minHeight: 110,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    outline: "none",
    resize: "vertical",
    font: "inherit",
  };

  async function saveProperty() {
    setMsg("");

    if (!code.trim()) {
      setMsg("Укажи код объекта.");
      return;
    }

    const payload = {
      code: code.trim(),
      name: name.trim() || null,
      address: address.trim() || null,
      description: description.trim() || null,
      isActive,
    };

    setSaving(true);

    try {
      if (mode === "create") {
        await sendJson("/api/properties", "POST", payload);
        setMsg("✅ Объект создан. Открываю список…");

        setTimeout(() => {
          window.location.href = "/properties";
        }, 300);
      } else {
        if (!propertyId) {
          throw new Error("Не передан propertyId");
        }

        await sendJson(`/api/properties/${propertyId}`, "PUT", payload);
        setMsg("✅ Объект сохранён. Открываю список…");

        setTimeout(() => {
          window.location.href = "/properties";
        }, 300);
      }
    } catch (e: any) {
      setMsg(`Ошибка: ${e?.message ?? String(e)}`);
    } finally {
      setSaving(false);
    }
  }

  const pageTitle =
    mode === "create" ? "Новый объект" : "Редактирование объекта";

  return (
    <main style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
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
            Карточка объекта для договоров, актов и счетов.
          </div>
        </div>

        <a
          href="/properties"
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
            <Label label="Код объекта">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                style={inputStyle}
                placeholder="Например: П 37-51"
              />
            </Label>

            <Label label="Наименование">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
                placeholder="Например: Склад, офис, помещение"
              />
            </Label>

            <Label label="Адрес">
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={inputStyle}
              />
            </Label>

            <Label label="Статус">
              <label
                style={{
                  height: 38,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "0 10px",
                  borderRadius: 10,
                  border: "1px solid #d1d5db",
                  background: "white",
                }}
              >
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <span style={{ fontSize: 14 }}>Активен</span>
              </label>
            </Label>
          </div>
        </Card>

        <Card title="Описание">
          <Label label="Примечание">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={textareaStyle}
              placeholder="Внутренний комментарий по объекту"
            />
          </Label>
        </Card>

        <Card title={mode === "create" ? "Создание" : "Сохранение"}>
          <button
            type="button"
            onClick={saveProperty}
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
                ? "Создать объект"
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