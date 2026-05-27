interface Props {
  params: Promise<{ slug: string }>;
}

export default async function FrameworkDetailPage({ params }: Props) {
  const { slug } = await params;

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "13px",
          color: "#64748b",
        }}
      >
        Framework guide for <strong>{slug}</strong> — coming soon.
      </p>
    </div>
  );
}
