import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PropertyForm from "@/components/properties/PropertyForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPropertyPage({ params }: PageProps) {
  const { id } = await params;

  const property = await prisma.property.findUnique({
    where: { id },
  });

  if (!property) {
    notFound();
  }

  return (
    <PropertyForm
      mode="edit"
      propertyId={property.id}
      initialData={{
        code: property.code,
        name: property.name ?? "",
        address: property.address ?? "",
        description: property.description ?? "",
        isActive: property.isActive,
      }}
    />
  );
}