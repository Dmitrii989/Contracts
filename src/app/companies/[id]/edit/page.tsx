import { notFound } from "next/navigation";
import CompanyForm from "@/components/companies/CompanyForm";
import { prisma } from "@/lib/prisma";

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const company = await prisma.company.findUnique({
    where: { id },
  });

  if (!company) {
    notFound();
  }

  return (
    <CompanyForm
      mode="edit"
      companyId={company.id}
      initialData={{
        name: company.name ?? "",
        shortName: company.shortName ?? "",
        inn: company.inn ?? "",
        kpp: company.kpp ?? "",
        ogrn: company.ogrn ?? "",
        address: company.address ?? "",
        postalAddress: company.postalAddress ?? "",
        email: company.email ?? "",
        phone: company.phone ?? "",
        bankName: company.bankName ?? "",
        bankBik: company.bankBik ?? "",
        bankAccount: company.bankAccount ?? "",
        correspondentAccount: company.correspondentAccount ?? "",
        directorName: company.directorName ?? "",
        directorPositionGenitive: company.directorPositionGenitive ?? "",
        directorPosition: company.directorPosition ?? "Генеральный директор",
        directorNameGenitive: company.directorNameGenitive ?? "",
        directorGender: company.directorGender ?? "MALE",
        basis: company.basis ?? "Устава",
      }}
    />
  );
}