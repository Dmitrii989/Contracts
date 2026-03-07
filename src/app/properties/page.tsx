"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Property = {
  id: string;
  code: string;
  address: string | null;
};

type StatusKind = "idle" | "saving" | "saved" | "error";
type StatusMap = Record<string, { kind: StatusKind; message?: string }>;

function normalizeAddress(value: string) {
  // Убираем лишние пробелы и переносы
  return value.replace(/\s+/g, " ").trim();
}

async function patchAddress(code: string, address: string) {
  const url = `/api/properties/by-code/${encodeURIComponent(code)}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
  type,
  propertyCode,
  checkIn,
  checkOut,
  priceRub,
  tenantId: tenantId || null, }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PATCH ${res.status}: ${text}`);
  }

  return (await res.json()) as Property;
}

export default function PropertiesPage() {
  const [items, setItems] = useState<Property[]>([]);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<StatusMap>({});

  // Модалка
  const [open, setOpen] = useState(false);
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [modalValue, setModalValue] = useState("");

  // Таймеры автосейва по каждому коду
  const saveTimers = useRef<Record<string, any>>({});

  // === Загрузка списка объектов
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/get-properties", { cache: "no-store" });
      const data = (await res.json()) as Property[];
      setItems(data);

      // Инициализируем черновики из базы
      const initial: Record<string, string> = {};
      for (const p of data) initial[p.code] = p.address ?? "";
      setDraft(initial);
    })();
  }, []);

  const itemsByCode = useMemo(() => {
    const map = new Map<string, Property>();
    items.forEach((p) => map.set(p.code, p));
    return map;
  }, [items]);

  // === Унифицированный способ показать статус по объекту
  function setItemStatus(code: string, kind: StatusKind, message?: string) {
    setStatus((prev) => ({ ...prev, [code]: { kind, message } }));
    if (kind === "saved") {
      // авто-сбрасываем "Сохранено" через 1.5 сек
      setTimeout(() => {
        setStatus((prev) => {
          if (prev[code]?.kind !== "saved") return prev;
          const next = { ...prev };
          next[code] = { kind: "idle" };
          return next;
        });
      }, 1500);
    }
  }

  // === Сохранение (общая функция)
  async function saveNow(code: string, value: string) {
    const normalized = normalizeAddress(value);

    // 3) Валидация: пустое не сохраняем
    if (!normalized) {
      setItemStatus(code, "error", "Адрес пустой — не сохраняю");
      return;
    }

    setItemStatus(code, "saving", "Сохраняю...");

    const updated = await patchAddress(code, normalized);

    // обновляем items
    setItems((prev) =>
      prev.map((p) => (p.code === code ? { ...p, address: updated.address } : p))
    );

    // синхронизируем черновик (если вдруг нормализовали пробелы)
    setDraft((prev) => ({ ...prev, [code]: updated.address ?? "" }));

    setItemStatus(code, "saved", "Сохранено");
  }

  // === 1) Автосохранение: вызываем при изменении поля (debounce 600ms)
  function scheduleAutoSave(code: string, value: string) {
    // чистим старый таймер
    if (saveTimers.current[code]) clearTimeout(saveTimers.current[code]);

    // ставим новый
    saveTimers.current[code] = setTimeout(async () => {
      try {
        // сохраняем только если реально изменилось относительно базы
        const current = itemsByCode.get(code)?.address ?? "";
        const normalizedDraft = normalizeAddress(value);
        const normalizedCurrent = normalizeAddress(current);

        if (!normalizedDraft) {
          // пустое не сохраняем — но не спамим ошибкой постоянно,
          // просто оставим подсказку если пользователь остановился.
          setItemStatus(code, "error", "Адрес пустой — не сохраняю");
          return;
        }

        if (normalizedDraft === normalizedCurrent) {
          setItemStatus(code, "idle");
          return;
        }

        await saveNow(code, value);
      } catch (e: any) {
        setItemStatus(code, "error", e?.message ?? "Ошибка сохранения");
      }
    }, 600);
  }

  // === UI helpers
  function badge(code: string) {
    const s = status[code]?.kind ?? "idle";
    const msg = status[code]?.message;

    if (s === "saving") return <span style={badgeStyle("#fff3cd", "#856404")}>{msg ?? "Сохраняю..."}</span>;
    if (s === "saved") return <span style={badgeStyle("#d4edda", "#155724")}>{msg ?? "Сохранено"}</span>;
    if (s === "error") return <span style={badgeStyle("#f8d7da", "#721c24")}>{msg ?? "Ошибка"}</span>;
    return null;
  }

  function openModal(code: string) {
    setActiveCode(code);
    setModalValue(draft[code] ?? "");
    setOpen(true);
  }

  async function modalSave() {
    if (!activeCode) return;
    try {
      await saveNow(activeCode, modalValue);
      setOpen(false);
      setActiveCode(null);
    } catch (e: any) {
      setItemStatus(activeCode, "error", e?.message ?? "Ошибка сохранения");
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <h1 style={{ fontSize: 40, marginBottom: 8 }}>Объекты</h1>
      <div style={{ marginBottom: 18, color: "#555" }}>
        Здесь справочник квартир (код + адрес). Адрес сохраняется автоматически.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {items.map((p) => (
          <div key={p.code} style={card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{p.code}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {badge(p.code)}
                {/* 4) Модалка */}
                <button style={btn} onClick={() => openModal(p.code)}>
                  Редактировать
                </button>
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              {/* Можно редактировать и прямо здесь: */}
              <input
                value={draft[p.code] ?? ""}
                placeholder="Введите адрес"
                onChange={(e) => {
                  const val = e.target.value;
                  setDraft((prev) => ({ ...prev, [p.code]: val }));
                  scheduleAutoSave(p.code, val);
                }}
                style={input}
              />
              <div style={{ marginTop: 6, fontSize: 12, color: "#777" }}>
                Автосохранение через 0.6 сек после остановки ввода. Пустой адрес не сохраняется.
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4) Модалка */}
      {open && activeCode && (
        <div style={modalOverlay} onMouseDown={() => setOpen(false)}>
          <div style={modal} onMouseDown={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>Редактирование адреса</div>
                <div style={{ marginTop: 4, color: "#666" }}>Объект: <b>{activeCode}</b></div>
              </div>
              <button style={btnGhost} onClick={() => setOpen(false)}>✕</button>
            </div>

            <textarea
              value={modalValue}
              onChange={(e) => setModalValue(e.target.value)}
              placeholder="Введите полный адрес"
              style={textarea}
            />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div>{badge(activeCode)}</div>
              <div style={{ display: "flex", gap: 10 }}>
                <button style={btnGhost} onClick={() => setOpen(false)}>Отмена</button>
                <button style={btnPrimary} onClick={modalSave}>Сохранить</button>
              </div>
            </div>

            <div style={{ marginTop: 8, fontSize: 12, color: "#777" }}>
              Пустой адрес не сохранится. Лишние пробелы будут убраны.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== styles (без Tailwind)
const card: React.CSSProperties = {
  border: "1px solid #e5e5e5",
  borderRadius: 12,
  padding: 14,
};

const input: React.CSSProperties = {
  width: "100%",
  height: 40,
  borderRadius: 8,
  border: "1px solid #ddd",
  padding: "0 12px",
  fontSize: 14,
};

const textarea: React.CSSProperties = {
  width: "100%",
  minHeight: 120,
  borderRadius: 10,
  border: "1px solid #ddd",
  padding: 12,
  fontSize: 14,
  marginTop: 12,
  marginBottom: 12,
  resize: "vertical",
};

const btn: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
};

const btnPrimary: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #1f6feb",
  background: "#1f6feb",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 600,
};

const btnGhost: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
};

function badgeStyle(bg: string, fg: string): React.CSSProperties {
  return {
    background: bg,
    color: fg,
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 12,
    border: "1px solid rgba(0,0,0,0.06)",
    whiteSpace: "nowrap",
  };
}

const modalOverlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
};

const modal: React.CSSProperties = {
  width: "min(720px, 100%)",
  background: "#fff",
  borderRadius: 14,
  border: "1px solid #e5e5e5",
  padding: 16,
};