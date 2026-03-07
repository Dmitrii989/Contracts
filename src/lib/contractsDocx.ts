import path from "path";
import fs from "fs";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { prisma } from "@/lib/prisma";

function formatRuDate(d: Date) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

function formatRuDateSafe(v: any) {
  if (!v) return "";
  const dt = v instanceof Date ? v : new Date(v);
  if (Number.isNaN(dt.getTime())) return "";
  return formatRuDate(dt);
}

function s(v: any) {
  return v === null || v === undefined ? "" : String(v);
}

function daysBetween(checkIn: Date, checkOut: Date) {
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  const ms = b.getTime() - a.getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

function moneyWordsRu(num: number) {
  const unitsMale = [
    "",
    "один",
    "два",
    "три",
    "четыре",
    "пять",
    "шесть",
    "семь",
    "восемь",
    "девять",
  ];

  const unitsFemale = [
    "",
    "одна",
    "две",
    "три",
    "четыре",
    "пять",
    "шесть",
    "семь",
    "восемь",
    "девять",
  ];

  const teens = [
    "десять",
    "одиннадцать",
    "двенадцать",
    "тринадцать",
    "четырнадцать",
    "пятнадцать",
    "шестнадцать",
    "семнадцать",
    "восемнадцать",
    "девятнадцать",
  ];

  const tens = [
    "",
    "",
    "двадцать",
    "тридцать",
    "сорок",
    "пятьдесят",
    "шестьдесят",
    "семьдесят",
    "восемьдесят",
    "девяносто",
  ];

  const hundreds = [
    "",
    "сто",
    "двести",
    "триста",
    "четыреста",
    "пятьсот",
    "шестьсот",
    "семьсот",
    "восемьсот",
    "девятьсот",
  ];

  function morph(n: number, f1: string, f2: string, f5: string) {
    n = Math.abs(n) % 100;
    const n1 = n % 10;

    if (n > 10 && n < 20) return f5;
    if (n1 > 1 && n1 < 5) return f2;
    if (n1 === 1) return f1;
    return f5;
  }

  function triadToWords(num: number, female = false) {
    let result: string[] = [];

    const u = female ? unitsFemale : unitsMale;

    const h = Math.floor(num / 100);
    const t = Math.floor((num % 100) / 10);
    const uNum = num % 10;

    if (h > 0) result.push(hundreds[h]);

    if (t > 1) {
      result.push(tens[t]);
      if (uNum > 0) result.push(u[uNum]);
    } else if (t === 1) {
      result.push(teens[uNum]);
    } else if (uNum > 0) {
      result.push(u[uNum]);
    }

    return result.join(" ");
  }

  const rub = Math.floor(num);
  const kop = Math.round((num - rub) * 100);
  if (rub === 0) {
  return `Ноль рублей ${String(kop).padStart(2, "0")} ${morph(kop, "копейка", "копейки", "копеек")}`;
}

  let words: string[] = [];

  const thousands = Math.floor(rub / 1000);
  const rest = rub % 1000;

  if (thousands > 0) {
    words.push(
      triadToWords(thousands, true),
      morph(thousands, "тысяча", "тысячи", "тысяч")
    );
  }

  if (rest > 0) {
    words.push(triadToWords(rest));
  }

  const rubWord = morph(rub, "рубль", "рубля", "рублей");
  const kopWord = morph(kop, "копейка", "копейки", "копеек");

  let result =
    words.join(" ") +
    " " +
    rubWord +
    " " +
    String(kop).padStart(2, "0") +
    " " +
    kopWord;

  result = result.trim();

  return result.charAt(0).toUpperCase() + result.slice(1);
}
function daysWord(n: number) {
  const v = Math.abs(Number(n)) % 100;
  const v1 = v % 10;

  if (v > 10 && v < 20) return "суток";
  if (v1 === 1) return "сутки";
  return "суток";
}

export async function buildDocxBuffer(
  id: string,
  templateName = "contract_person_template.docx"
): Promise<{ docx: Buffer; filenameBase: string }> {
  const contract = await prisma.contract.findUnique({
    where: { id },
    include: { property: true, tenant: true },
  });

  if (!contract) {
    throw Object.assign(new Error("Not found"), { status: 404 });
  }

  const templatePath = path.join(process.cwd(), "templates", templateName);
  if (!fs.existsSync(templatePath)) {
    throw Object.assign(new Error("Template not found"), { status: 500, templatePath });
  }

  const content = fs.readFileSync(templatePath, "binary");
  const zip = new PizZip(content);

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  const tenant = contract.tenant;

  const tenantFio = tenant?.fio ?? contract.tenantName ?? "";

  const tenantPassport = tenant
    ? `${tenant.passportSeries ?? ""} ${tenant.passportNumber ?? ""}`.replace(/\s+/g, " ").trim()
    : (contract.tenantPassport ?? "");

  const tenantRegAddress = tenant?.regAddress ?? contract.tenantAddress ?? "";

  // подпись: если не сохранено — соберём из ФИО
  const signInitials =
    tenant?.signInitials ??
    (tenantFio
      ? tenantFio
          .split(/\s+/)
          .slice(1)
          .map((p) => (p ? p[0].toUpperCase() + "." : ""))
          .join("")
      : "");

  const signSurname =
    tenant?.signSurname ??
    (tenantFio ? (tenantFio.split(/\s+/)[0] ?? "") : "");

  const days = daysBetween(contract.checkIn, contract.checkOut);

  // дата договора
  const contractDate = contract.createdAt;

  // дата счёта/оплаты — как ты хотел: дата выезда
  const payDeadlineDate = contract.checkOut;

  doc.setData({
    // договор
    CONTRACT_NUMBER: s(contract.number),
    CONTRACT_DATE: formatRuDateSafe(contractDate),

    // проживание
    CHECKIN_DATE: formatRuDateSafe(contract.checkIn),
    CHECKOUT_DATE: formatRuDateSafe(contract.checkOut),
    DAYS: s(days),
    DAYS_WORD: daysWord(days),

    // деньги
    PRICE_PER_DAY: s(
  contract.pricePerDayRub !== null && contract.pricePerDayRub !== undefined
    ? contract.pricePerDayRub.toLocaleString("ru-RU")
    : ""
),
    RENT_PRICE: s(
  contract.priceRub !== null && contract.priceRub !== undefined
    ? contract.priceRub.toLocaleString("ru-RU")
    : ""
),
    PRICE_WORDS: s(moneyWordsRu(contract.priceRub ?? 0)),

    // объект
    PROPERTY_ADDRESS: s(contract.property?.address ?? ""),

    // дата выставления счёта
    PAY_DEADLINE_DATE: formatRuDateSafe(payDeadlineDate),

    // арендатор
    TENANT_FIO: s(tenantFio),
    TENANT_BIRTHDATE: formatRuDateSafe(tenant?.birthDate),

    TENANT_PASSPORT: s(tenantPassport),
    TENANT_PASSPORT_ISSUED_BY: s(tenant?.passportIssuedBy ?? ""),
    TENANT_PASSPORT_CODE: s(tenant?.passportCode ?? ""),
    TENANT_PASSPORT_ISSUED_AT: formatRuDateSafe(tenant?.passportIssuedAt),

    TENANT_ADDRESS: s(tenantRegAddress),

    // подпись
    TENANT_SIGN_INITIALS: s(signInitials),
    TENANT_SIGN_SURNAME: s(signSurname),
  });

  doc.render();

  const docx: Buffer = doc.getZip().generate({ type: "nodebuffer" });
  const filenameBase = `Договор_${contract.number.replace("/", "-")}_${contract.propertyCode}`;

  return { docx, filenameBase };
}