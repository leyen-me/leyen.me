import AuthorEditor from "@/app/admin/components/AuthorEditor";
export default function Page({ params }: { params: { id: string } }) {
  return <AuthorEditor itemId={params.id} />;
}
