import PostEditor from "@/app/admin/components/PostEditor";

type Props = { params: { id: string } };

export default function EditPostPage({ params }: Props) {
  return <PostEditor postId={params.id} />;
}
