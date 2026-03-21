"use client";

import { useEffect, useMemo, useState } from "react";
import {
  filterInputStyle,
  pageMainStyle,
  pageHeaderStyle,
  pageHeaderActionsStyle,
  secondaryButtonStyle,
  primaryButtonStyle,
  cardSectionStyle,
} from "@/components/ui/styles";
import TableCard from "@/components/ui/TableCard";

type PropertyRow = {
  id: string;
  code: string;
  name?: string | null;
  address?: string | null;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

async function sendJson(url: string, method: "PATCH", body: unknown) {
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

export default function PropertiesPage() {
  const [items, setItems] = useState<PropertyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [query, setQuery] = useState("");
  const [savingId, setSavingId] = useState("");
  const [editing, setEditing] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [hovered, setHovered] = useState<{ id: string; field: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  async function load() {
    try {
      setLoading(true);
      setErr("");

      const r = await fetch("/api/properties", { cache: "no-store" });
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
  }

  useEffect(() => {
    load();
  }, []);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();

    return items.filter((p) => {
      const matchesQuery =
        !q ||
        (p.code || "").toLowerCase().includes(q) ||
        (p.name || "").toLowerCase().includes(q) ||
        (p.address || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && p.isActive) ||
        (statusFilter === "INACTIVE" && !p.isActive);

      return matchesQuery && matchesStatus;
    });
  }, [items, query, statusFilter]);

  async function saveField(id: string, field: string) {
    try {
      await fetch(`/api/properties/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: editValue }),
      });

      setItems((prev) =>
        prev.map((p) => (p.id === id ? { ...p, [field]: editValue } : p))
      );

      setEditing(null);
      setEditValue("");
    } catch {
      alert("Ошибка сохранения");
    }
  }

  function cancelEditing() {
    setEditing(null);
    setEditValue("");
  }

  async function toggleActive(id: string, isActive: boolean) {
    try {
      setSavingId(id);
      await sendJson(`/api/properties/${id}`, "PATCH", { isActive: !isActive });

      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isActive: !isActive } : item
        )
      );
    } catch (e: any) {
      alert(`Ошибка: ${e?.message ?? String(e)}`);
    } finally {
      setSavingId("");
    }
  }

  const editableCellStyle = (active: boolean): React.CSSProperties => ({
    padding: "6px 8px",
    borderRadius: 8,
    cursor: "text",
    background: active ? "#eff6ff" : "transparent",
    outline: active ? "2px solid #bfdbfe" : "none",
    minHeight: 34,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  });

  const GRID = "150px 190px 1.3fr 1fr 150px 170px";

  return (
    <main style={pageMainStyle}>
      <div style={pageHeaderStyle}>
        <div>
          <h1 style={{ margin: 0, fontSize: 34 }}>Объекты</h1>
          <div style={{ marginTop: 6, fontSize: 13, opacity: 0.7 }}>
            Список объектов для договоров, актов и счетов.
          </div>
        </div>

        <div style={pageHeaderActionsStyle}>
          <a href="/contracts" style={secondaryButtonStyle}>
            Договоры
          </a>

          <a href="/properties/new" style={primaryButtonStyle}>
            + Новый объект
          </a>
        </div>
      </div>

      <div
        style={{
          marginTop: 16,
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по коду, названию, адресу, описанию"
          style={filterInputStyle}
        />

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            style={{
              ...secondaryButtonStyle,
              background: statusFilter === "ALL" ? "#111827" : "white",
              color: statusFilter === "ALL" ? "white" : "#111827",
              border: "1px solid " + (statusFilter === "ALL" ? "#111827" : "#d1d5db"),
              cursor: "pointer",
            }}
          >
            Все
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("ACTIVE")}
            style={{
              ...secondaryButtonStyle,
              background: statusFilter === "ACTIVE" ? "#111827" : "white",
              color: statusFilter === "ACTIVE" ? "white" : "#111827",
              border: "1px solid " + (statusFilter === "ACTIVE" ? "#111827" : "#d1d5db"),
              cursor: "pointer",
            }}
          >
            Активные
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("INACTIVE")}
            style={{
              ...secondaryButtonStyle,
              background: statusFilter === "INACTIVE" ? "#111827" : "white",
              color: statusFilter === "INACTIVE" ? "white" : "#111827",
              border: "1px solid " + (statusFilter === "INACTIVE" ? "#111827" : "#d1d5db"),
              cursor: "pointer",
            }}
          >
            Неактивные
          </button>
        </div>

        <div style={{ fontSize: 12, opacity: 0.65 }}>
          Найдено: {filteredItems.length}
        </div>
      </div>

      <div style={{ marginTop: 10, fontSize: 12, opacity: 0.65 }}>
        Название и адрес: Enter — сохранить, Esc — отмена. Описание: Ctrl+Enter — сохранить.
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
              gap: 0,
              background: "#f9fafb",
              padding: "10px 12px",
              fontWeight: 700,
            }}
          >
            <div>Код</div>
            <div>Название</div>
            <div>Адрес</div>
            <div>Описание</div>
            <div>Статус</div>
            <div>Действия</div>
          </div>

          {filteredItems.length === 0 ? (
            <div style={{ padding: 18, textAlign: "center", opacity: 0.7 }}>
              Объекты не найдены.
            </div>
          ) : (
            filteredItems.map((p) => (
              <div
                key={p.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: GRID,
                  padding: "10px 12px",
                  borderTop: "1px solid #f1f5f9",
                  alignItems: "center",
                }}
              >
                <div style={{ fontWeight: 800 }}>{p.code}</div>

                <div
                  style={editableCellStyle(editing?.id === p.id && editing.field === "name")}
                  onMouseEnter={() => setHovered({ id: p.id, field: "name" })}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => {
                    setEditing({ id: p.id, field: "name" });
                    setEditValue(p.name || "");
                  }}
                >
                  {editing?.id === p.id && editing.field === "name" ? (
                    <input
                      value={editValue}
                      autoFocus
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => saveField(p.id, "name")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveField(p.id, "name");
                        if (e.key === "Escape") cancelEditing();
                      }}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        width: "100%",
                        padding: "6px 8px",
                        border: "1px solid #93c5fd",
                        borderRadius: 8,
                        outline: "none",
                        background: "white",
                      }}
                    />
                  ) : (
                    <>
                      <span>{p.name || "—"}</span>
                      {hovered?.id === p.id && hovered.field === "name" ? (
                        <span style={{ fontSize: 12, opacity: 0.55 }}>✏️</span>
                      ) : null}
                    </>
                  )}
                </div>

                <div
                  title={p.address || ""}
                  style={editableCellStyle(editing?.id === p.id && editing.field === "address")}
                  onMouseEnter={() => setHovered({ id: p.id, field: "address" })}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => {
                    setEditing({ id: p.id, field: "address" });
                    setEditValue(p.address || "");
                  }}
                >
                  {editing?.id === p.id && editing.field === "address" ? (
                    <input
                      value={editValue}
                      autoFocus
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => saveField(p.id, "address")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveField(p.id, "address");
                        if (e.key === "Escape") cancelEditing();
                      }}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        width: "100%",
                        padding: "6px 8px",
                        border: "1px solid #93c5fd",
                        borderRadius: 8,
                        outline: "none",
                        background: "white",
                      }}
                    />
                  ) : (
                    <>
                      <span>{p.address || "—"}</span>
                      {hovered?.id === p.id && hovered.field === "address" ? (
                        <span style={{ fontSize: 12, opacity: 0.55 }}>✏️</span>
                      ) : null}
                    </>
                  )}
                </div>

                <div
                  title={p.description || ""}
                  style={{
                    ...editableCellStyle(
                      editing?.id === p.id && editing.field === "description"
                    ),
                    alignItems:
                      editing?.id === p.id && editing.field === "description"
                        ? "stretch"
                        : "center",
                  }}
                  onMouseEnter={() => setHovered({ id: p.id, field: "description" })}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => {
                    setEditing({ id: p.id, field: "description" });
                    setEditValue(p.description || "");
                  }}
                >
                  {editing?.id === p.id && editing.field === "description" ? (
                    <textarea
                      value={editValue}
                      autoFocus
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => saveField(p.id, "description")}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") cancelEditing();
                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                          saveField(p.id, "description");
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      rows={3}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        border: "1px solid #93c5fd",
                        borderRadius: 8,
                        outline: "none",
                        background: "white",
                        resize: "vertical",
                        font: "inherit",
                      }}
                      placeholder="Введите описание"
                    />
                  ) : (
                    <>
                      <span
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          display: "block",
                          width: "100%",
                        }}
                      >
                        {p.description || "—"}
                      </span>
                      {hovered?.id === p.id && hovered.field === "description" ? (
                        <span style={{ fontSize: 12, opacity: 0.55, flexShrink: 0 }}>
                          ✏️
                        </span>
                      ) : null}
                    </>
                  )}
                </div>

                <div>
                  <label
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      cursor: savingId === p.id ? "not-allowed" : "pointer",
                      opacity: savingId === p.id ? 0.7 : 1,
                      userSelect: "none",
                    }}
                  >
                    <span
                      style={{
                        position: "relative",
                        width: 42,
                        height: 24,
                        borderRadius: 999,
                        background: p.isActive ? "#111827" : "#d1d5db",
                        transition: "all 0.2s ease",
                        display: "inline-block",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={p.isActive}
                        disabled={savingId === p.id}
                        onChange={() => toggleActive(p.id, p.isActive)}
                        style={{
                          position: "absolute",
                          inset: 0,
                          opacity: 0,
                          cursor: savingId === p.id ? "not-allowed" : "pointer",
                          margin: 0,
                        }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          top: 3,
                          left: p.isActive ? 21 : 3,
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          background: "white",
                          transition: "left 0.2s ease",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                        }}
                      />
                    </span>

                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: p.isActive ? "#065f46" : "#374151",
                        minWidth: 84,
                      }}
                    >
                      {savingId === p.id
                        ? "Сохраняю..."
                        : p.isActive
                        ? "Активен"
                        : "Неактивен"}
                    </span>
                  </label>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "nowrap", alignItems: "center" }}>
                  <a href={`/properties/${p.id}/edit`} style={secondaryButtonStyle}>
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