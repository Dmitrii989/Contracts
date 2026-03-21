"use client";

import { useEffect, useMemo, useState } from "react";
import TableCard from "@/components/ui/TableCard";
import {
  filterInputStyle,
  pageMainStyle,
  pageHeaderStyle,
  pageHeaderActionsStyle,
  secondaryButtonStyle,
  primaryButtonStyle,
} from "@/components/ui/styles";

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
  tenantName: string | null;
  companyName: string | null;
  createdAt: string;
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU");
}

function money(n?: number | null) {
  const v = Math.max(0, Math.floor(Number(n) || 0));
  return v.toLocaleString("ru-RU");
}

const sortableHeaderStyle: React.CSSProperties = {
  cursor: "pointer",
  userSelect: "none",
};

export default function ContractsPage() {
  const [items, setItems] = useState<ContractRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "PERSON" | "COMPANY">("ALL");
  const [propertyFilter, setPropertyFilter] = useState("ALL");
  const [checkInFrom, setCheckInFrom] = useState("");
  const [checkInTo, setCheckInTo] = useState("");
  const [sortBy, setSortBy] = useState<
    "number" | "type" | "propertyCode" | "counterparty" | "checkIn" | "checkOut" | "priceRub"
  >("checkIn");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

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
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : String(e));
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const GRID = useMemo(
    () => "120px 90px 140px 1.6fr 110px 110px 180px 240px",
    []
  );

  const propertyOptions = useMemo(() => {
    const map = new Map<string, string>();

    for (const c of items) {
      const label = c.propertyAddress
        ? `${c.propertyCode} — ${c.propertyAddress}`
        : c.propertyCode;

      if (!map.has(c.propertyCode)) {
        map.set(c.propertyCode, label);
      }
    }

    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, "ru"));
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((c) => {
      const q = query.trim().toLowerCase();

      const matchesQuery =
        !q ||
        (c.number || "").toLowerCase().includes(q) ||
        (c.propertyCode || "").toLowerCase().includes(q) ||
        (c.propertyAddress || "").toLowerCase().includes(q) ||
        (c.tenantName || "").toLowerCase().includes(q) ||
        (c.companyName || "").toLowerCase().includes(q);

      const matchesType = typeFilter === "ALL" || c.type === typeFilter;
      const matchesProperty =
        propertyFilter === "ALL" || c.propertyCode === propertyFilter;

      const checkInDate = new Date(c.checkIn);
      const fromOk =
        !checkInFrom || checkInDate >= new Date(checkInFrom + "T00:00:00");
      const toOk =
        !checkInTo || checkInDate <= new Date(checkInTo + "T23:59:59");

      return matchesQuery && matchesType && matchesProperty && fromOk && toOk;
    });
  }, [items, query, typeFilter, propertyFilter, checkInFrom, checkInTo]);

  const filteredAndSortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;

      const aCounterparty =
        a.type === "COMPANY" ? a.companyName || "" : a.tenantName || "";
      const bCounterparty =
        b.type === "COMPANY" ? b.companyName || "" : b.tenantName || "";

      switch (sortBy) {
        case "number":
          return a.number.localeCompare(b.number, "ru") * dir;
        case "type":
          return a.type.localeCompare(b.type, "ru") * dir;
        case "propertyCode":
          return (a.propertyCode || "").localeCompare(b.propertyCode || "", "ru") * dir;
        case "counterparty":
          return aCounterparty.localeCompare(bCounterparty, "ru") * dir;
        case "checkIn":
          return (new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime()) * dir;
        case "checkOut":
          return (new Date(a.checkOut).getTime() - new Date(b.checkOut).getTime()) * dir;
        case "priceRub":
          return ((a.priceRub || 0) - (b.priceRub || 0)) * dir;
        default:
          return 0;
      }
    });
  }, [filteredItems, sortBy, sortDir]);

  function toggleSort(field: typeof sortBy) {
    if (sortBy === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortBy(field);
    setSortDir("asc");
  }

  function sortMark(field: typeof sortBy) {
    if (sortBy !== field) return "";
    return sortDir === "asc" ? " ↑" : " ↓";
  }

  return (
    <main style={pageMainStyle}>
      <div style={pageHeaderStyle}>
        <h1 style={{ fontSize: 36, margin: 0 }}>Договоры</h1>

        <div style={pageHeaderActionsStyle}>
          <a href="/properties" style={secondaryButtonStyle}>
            Объекты
          </a>

          <a href="/contracts/new" style={primaryButtonStyle}>
            + Новый договор
          </a>
        </div>
      </div>

      <div
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "minmax(280px, 520px) 180px 260px 170px 170px",
          gap: 12,
          alignItems: "center",
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по номеру, объекту, адресу, арендатору"
          style={{ ...filterInputStyle, maxWidth: "none" }}
        />

        <select
          value={typeFilter}
          onChange={(e) =>
            setTypeFilter(e.target.value as "ALL" | "PERSON" | "COMPANY")
          }
          style={{ ...filterInputStyle, maxWidth: "none" }}
        >
          <option value="ALL">Все типы</option>
          <option value="PERSON">Физик</option>
          <option value="COMPANY">Юрлицо</option>
        </select>

        <select
          value={propertyFilter}
          onChange={(e) => setPropertyFilter(e.target.value)}
          style={{ ...filterInputStyle, maxWidth: "none" }}
        >
          <option value="ALL">Все объекты</option>
          {propertyOptions.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>

        <input type="date" value={checkInFrom} onChange={(e) => setCheckInFrom(e.target.value)} style={filterInputStyle} />
        <input type="date" value={checkInTo} onChange={(e) => setCheckInTo(e.target.value)} style={filterInputStyle} />
      </div>

      <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setTypeFilter("ALL");
            setPropertyFilter("ALL");
            setCheckInFrom("");
            setCheckInTo("");
          }}
          style={secondaryButtonStyle}
        >
          Сбросить фильтры
        </button>

        <div style={{ fontSize: 12, opacity: 0.65 }}>
          Найдено: {filteredItems.length}
        </div>
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
              background: "#fafafa",
              padding: "10px 12px",
              fontWeight: 700,
            }}
          >
            <div onClick={() => toggleSort("number")} style={sortableHeaderStyle}>
              Номер{sortMark("number")}
            </div>
            <div onClick={() => toggleSort("type")} style={sortableHeaderStyle}>
              Тип{sortMark("type")}
            </div>
            <div onClick={() => toggleSort("propertyCode")} style={sortableHeaderStyle}>
              Объект{sortMark("propertyCode")}
            </div>
            <div onClick={() => toggleSort("counterparty")} style={sortableHeaderStyle}>
              Арендатор / юрлицо{sortMark("counterparty")}
            </div>
            <div onClick={() => toggleSort("checkIn")} style={sortableHeaderStyle}>
              Заезд{sortMark("checkIn")}
            </div>
            <div onClick={() => toggleSort("checkOut")} style={sortableHeaderStyle}>
              Выезд{sortMark("checkOut")}
            </div>
            <div onClick={() => toggleSort("priceRub")} style={sortableHeaderStyle}>
              Сумма{sortMark("priceRub")}
            </div>
            <div>Файлы</div>
          </div>

          {filteredAndSortedItems.map((c) => {
            const counterparty =
              c.type === "COMPANY" ? c.companyName || "—" : c.tenantName || "—";

            return (
              <div
                key={c.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: GRID,
                  padding: "10px 12px",
                  borderTop: "1px solid #eee",
                  cursor: "pointer",
                }}
                onClick={() => (window.location.href = `/contracts/${c.id}`)}
              >
                <div style={{ fontWeight: 800 }}>{c.number}</div>
                <div>{c.type === "PERSON" ? "Физик" : "Юрлицо"}</div>
                <div title={c.propertyAddress ?? ""}>{c.propertyCode}</div>
                <div>{counterparty}</div>
                <div>{fmtDate(c.checkIn)}</div>
                <div>{fmtDate(c.checkOut)}</div>
                <div>{money(c.priceRub)} ₽</div>

                <div style={{ display: "flex", gap: 8 }}>
                  <a
                    href={`/contracts/new?copyFrom=${c.id}`}
                    onClick={(e) => e.stopPropagation()}
                    style={secondaryButtonStyle}
                  >
                    Копировать
                  </a>

                  <a
                    href={`/api/contracts/${c.id}/docx`}
                    target="_blank"
                    onClick={(e) => e.stopPropagation()}
                    style={secondaryButtonStyle}
                  >
                    DOCX
                  </a>

                  <a
                    href={`/api/contracts/${c.id}/pdf`}
                    target="_blank"
                    onClick={(e) => e.stopPropagation()}
                    style={secondaryButtonStyle}
                  >
                    PDF
                  </a>
                </div>
              </div>
            );
          })}
        </TableCard>
      )}
    </main>
  );
}