"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const baseLinkStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 10,
  textDecoration: "none",
  fontWeight: 700,
  transition: "all 0.15s ease",
};

function getLinkStyle(pathname: string, href: string): React.CSSProperties {
  const isActive =
    pathname === href || pathname.startsWith(href + "/");

  return {
    ...baseLinkStyle,
    background: isActive ? "#111827" : "transparent",
    color: isActive ? "white" : "#111827",
    border: "1px solid " + (isActive ? "#111827" : "transparent"),
  };
}

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
      }}
    >
      <Link href="/contracts" style={getLinkStyle(pathname, "/contracts")}>
        Договоры
      </Link>

      <Link href="/properties" style={getLinkStyle(pathname, "/properties")}>
        Объекты
      </Link>

      <Link href="/tenants" style={getLinkStyle(pathname, "/tenants")}>
        Арендаторы
      </Link>

      <Link href="/companies" style={getLinkStyle(pathname, "/companies")}>
        Компании
      </Link>
    </nav>
  );
}