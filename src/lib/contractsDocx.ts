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

function buildLandlordIntro() {
  return `Индивидуальный предприниматель Рябухин Дмитрий Сергеевич, действующий на основании государственной регистрации в качестве индивидуального предпринимателя, ОГРНИП 321253600084518, именуемый в дальнейшем «Арендодатель»`;
}

function moneyWordsRu(num: number) {
  const unitsMale = ["", "один", "два", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять"];
  const unitsFemale = ["", "одна", "две", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять"];
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
  const tens = ["", "", "двадцать", "тридцать", "сорок", "пятьдесят", "шестьдесят", "семьдесят", "восемьдесят", "девяносто"];
  const hundreds = ["", "сто", "двести", "триста", "четыреста", "пятьсот", "шестьсот", "семьсот", "восемьсот", "девятьсот"];

  function morph(n: number, f1: string, f2: string, f5: string) {
    n = Math.abs(n) % 100;
    const n1 = n % 10;
    if (n > 10 && n < 20) return f5;
    if (n1 > 1 && n1 < 5) return f2;
    if (n1 === 1) return f1;
    return f5;
  }

  function triadToWords(num: number, female = false) {
    const result: string[] = [];
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

  const words: string[] = [];
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

function getCompanyKind(contract: any) {
  return contract.company?.kind ?? contract.companyKind ?? "";
}

function getCompanyNamedAs(contract: any) {
  const kind = getCompanyKind(contract);

  if (kind === "IP") {
    return contract.companyDirectorGender === "FEMALE" ? "именуемая" : "именуемый";
  }

  return "именуемое";
}

function getTenantNamedAs(gender?: "MALE" | "FEMALE" | null) {
  return gender === "FEMALE" ? "именуемая" : "именуемый";
}

function getCompanyActingAs() {
  return "действующего";
}

function getIpActingAs(gender?: "MALE" | "FEMALE" | null) {
  return gender === "FEMALE" ? "действующая" : "действующий";
}

function toShortFio(fio?: string | null) {
  if (!fio) return "";

  const parts = fio.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";

  const lastName = parts[0] ?? "";
  const firstName = parts[1] ?? "";
  const middleName = parts[2] ?? "";

  const firstInitial = firstName ? `${firstName[0].toUpperCase()}.` : "";
  const middleInitial = middleName ? `${middleName[0].toUpperCase()}.` : "";

  return `${firstInitial}${middleInitial} ${lastName}`.trim();
}

function buildCompanyIntro(contract: any) {
  const kind = getCompanyKind(contract);
  const companyName = (contract.companyName ?? "").trim();
  const position = (contract.companyDirectorPosition ?? "").trim();
  const fio = (contract.companyDirectorName ?? "").trim();
  const positionGenitive = (contract.companyDirectorPositionGenitive ?? "").trim();
  const fioGenitive = (contract.companyDirectorNameGenitive ?? "").trim();
  const named = getCompanyNamedAs(contract);

  if (kind === "IP") {
    const ogrnip = (contract.companyOgrn ?? "").trim();
    const acting = getIpActingAs(contract.companyDirectorGender);

    return `Индивидуальный предприниматель ${fio}, ${acting} на основании государственной регистрации в качестве индивидуального предпринимателя, ОГРНИП ${ogrnip}, ${named} в дальнейшем «Арендатор»`;
  }

  let basis = (contract.companyBasis ?? "").trim();
  if (!basis) {
    basis = "Устава";
  }

  const pos = positionGenitive || position;
  const name = fioGenitive || fio;
  const acting = getCompanyActingAs();

  return `${companyName}, в лице ${pos} ${name}, ${acting} на основании ${basis}, ${named} в дальнейшем «Арендатор»`;
}

function getCompanyKpp(contract: any) {
  const kind = getCompanyKind(contract);
  if (kind === "IP") return "";
  return contract.companyKpp ?? "";
}

function getCompanyOgrnLabel(contract: any) {
  const kind = getCompanyKind(contract);
  return kind === "IP" ? "ОГРНИП" : "ОГРН";
}

export async function buildDocxBuffer(
  id: string,
  templateName?: string
): Promise<{ docx: Buffer; filenameBase: string }> {
  const contract = await prisma.contract.findUnique({
    where: { id },
    include: { property: true, tenant: true, company: true },
  });

  if (!contract) {
    throw Object.assign(new Error("Not found"), { status: 404 });
  }

  const resolvedTemplateName =
    templateName ??
    (contract.type === "COMPANY"
      ? "contract_company_template.docx"
      : "contract_person_template.docx");

  const templatePath = path.join(process.cwd(), "templates", resolvedTemplateName);
if (!fs.existsSync(templatePath)) {
  throw Object.assign(new Error("Template not found"), {
    status: 500,
    templatePath,
  });
}

const content = fs.readFileSync(templatePath);

console.log("DOCX LOAD:", {
  templatePath,
  isBuffer: Buffer.isBuffer(content),
  type: typeof content,
});

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
  const tenantNamedAs = getTenantNamedAs(tenant?.gender);

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

  const companyDirectorShortFio = toShortFio(contract.companyDirectorName);

  const days = daysBetween(contract.checkIn, contract.checkOut);

  const contractDate = contract.contractDate ?? contract.createdAt;
  const actDate = contract.actDate ?? contract.checkOut;
  const invoiceDate = contract.invoiceDate ?? contract.checkOut;
  const payDeadlineDate = contract.checkOut;

  const isPerson = contract.type === "PERSON";
  const isCompany = contract.type === "COMPANY";
  const landlordIntro = buildLandlordIntro();
  const guests = (contract.companyGuestText ?? "").trim();

const guestPhrase = guests
  ? guests.includes(",")
    ? `для проживания представителей арендатора: ${guests}`
    : `для проживания представителя арендатора: ${guests}`
  : `для проживания`;

const companyStayPurposeText =
  `Предоставление во временное пользование жилого помещения по адресу: ${s(contract.property?.address ?? "")} ${guestPhrase} в период с ${formatRuDateSafe(contract.checkIn)} г. по ${formatRuDateSafe(contract.checkOut)} г.`;

  try {
  doc.render({
    CONTRACT_TYPE: s(contract.type),
    IS_PERSON: isPerson,
    IS_COMPANY: isCompany,
    LANDLORD_INTRO: s(landlordIntro),

    CONTRACT_NUMBER: s(contract.number),
    CONTRACT_DATE: formatRuDateSafe(contractDate),
    ACT_DATE: formatRuDateSafe(actDate),
    INVOICE_DATE: formatRuDateSafe(invoiceDate),

    CHECKIN_DATE: formatRuDateSafe(contract.checkIn),
    CHECKOUT_DATE: formatRuDateSafe(contract.checkOut),
    DAYS: s(days),
    DAYS_WORD: daysWord(days),

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

    PROPERTY_CODE: s(contract.propertyCode),
    PROPERTY_ADDRESS: s(contract.property?.address ?? ""),

    PAY_DEADLINE_DATE: formatRuDateSafe(payDeadlineDate),

    TENANT_FIO: s(tenantFio),
    TENANT_NAMED_AS: s(tenantNamedAs),
    TENANT_BIRTHDATE: formatRuDateSafe(tenant?.birthDate),

    TENANT_PASSPORT: s(tenantPassport),
    TENANT_PASSPORT_ISSUED_BY: s(tenant?.passportIssuedBy ?? ""),
    TENANT_PASSPORT_CODE: s(tenant?.passportCode ?? ""),
    TENANT_PASSPORT_ISSUED_AT: formatRuDateSafe(tenant?.passportIssuedAt),

    TENANT_ADDRESS: s(tenantRegAddress),

    TENANT_SIGN_INITIALS: s(signInitials),
    TENANT_SIGN_SURNAME: s(signSurname),

    COMPANY_NAME: s(contract.companyName),
    COMPANY_SHORT_NAME: s(contract.companyShortName),
    COMPANY_KIND: s(getCompanyKind(contract)),
    COMPANY_INN: s(contract.companyInn),
    COMPANY_KPP: s(getCompanyKpp(contract)),
    COMPANY_OGRN: s(contract.companyOgrn),
    COMPANY_OGRN_LABEL: s(getCompanyOgrnLabel(contract)),
    COMPANY_ADDRESS: s(contract.companyAddress),
    COMPANY_POSTAL_ADDRESS: s(contract.companyPostalAddress ?? ""),
    COMPANY_EMAIL: s(contract.companyEmail),
    COMPANY_PHONE: s(contract.companyPhone),

    COMPANY_BANK_NAME: s(contract.companyBankName),
    COMPANY_BANK_BIK: s(contract.companyBankBik),
    COMPANY_BANK_ACCOUNT: s(contract.companyBankAccount),
    COMPANY_CORRESPONDENT_ACCOUNT: s(contract.companyCorrespondentAccount),

    COMPANY_DIRECTOR_NAME: s(contract.companyDirectorName),
    COMPANY_DIRECTOR_SHORT_FIO: s(companyDirectorShortFio),
    COMPANY_DIRECTOR_POSITION: s(contract.companyDirectorPosition),
    COMPANY_DIRECTOR_POSITION_GENITIVE: s(contract.companyDirectorPositionGenitive),
    COMPANY_DIRECTOR_GENDER: s(contract.companyDirectorGender),
    COMPANY_DIRECTOR_NAME_GENITIVE: s(contract.companyDirectorNameGenitive),
    COMPANY_BASIS: s(contract.companyBasis),
    COMPANY_GUEST_TEXT: s(contract.companyGuestText ?? ""),
    COMPANY_STAY_PURPOSE_TEXT: s(companyStayPurposeText),

    COMPANY_ACTING_AS: s(getCompanyActingAs()),
    COMPANY_NAMED_AS: s(getCompanyNamedAs(contract)),
    COMPANY_INTRO: s(buildCompanyIntro(contract)),

    COMPANY_INN_KPP_TEXT:
      getCompanyKind(contract) === "IP"
        ? `ИНН: ${s(contract.companyInn)}`
        : `ИНН/КПП: ${s(contract.companyInn)}${contract.companyKpp ? " / " + s(contract.companyKpp) : ""}`,

    COMPANY_OGRN_TEXT:
      getCompanyKind(contract) === "IP"
        ? `ОГРНИП: ${s(contract.companyOgrn)}`
        : `ОГРН: ${s(contract.companyOgrn)}`,
  });
} catch (err: any) {
  console.error("DOCX RENDER ERROR", err);
  throw err;
}


  const docx: Buffer = doc.getZip().generate({ type: "nodebuffer" });
  const filenameBase = `Договор_${contract.number.replace("/", "-")}_${contract.propertyCode}`;

  return { docx, filenameBase };
}