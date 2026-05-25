import MovieEditor from "@/app/admin/components/MovieEditor";
export default function Page({ params }: { params: { id: string } }) {
  return <MovieEditor itemId={params.id} />;
}
