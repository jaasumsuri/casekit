import { notFound } from "next/navigation";
import cases from "@/data/practice-cases.json";
import InterviewClient from "./interview";

interface CaseMeta {
  slug: string;
  title: string;
  industry: string;
  difficulty: string;
  companyStyle: string;
  brief: string;
  framework: string;
  totalSteps: number;
}

function getCaseMeta(slug: string): CaseMeta | null {
  const c = cases.cases.find((c: { slug: string }) => c.slug === slug);
  if (!c) return null;
  return {
    slug: c.slug,
    title: c.title,
    industry: c.industry,
    difficulty: c.difficulty,
    companyStyle: c.company_style,
    brief: c.brief,
    framework: c.rubric.correct_framework,
    totalSteps: c.rubric.data_release_sequence.length,
  };
}

export default async function PracticeInterviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const caseMeta = getCaseMeta(slug);
  if (!caseMeta) notFound();

  return <InterviewClient caseMeta={caseMeta} />;
}
