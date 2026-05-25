import QuoteEditor from "@/app/admin/components/QuoteEditor";
export default function Page({ params }: { params: { id: string } }) {
  return <QuoteEditor itemId={params.id} />;
}
