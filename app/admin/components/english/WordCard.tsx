"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ENGLISH_WORD_STATUS_LABELS,
  type EnglishWordStatus,
} from "@/lib/admin/english/constants";

export type WordSummary = {
  _id: string;
  word: string;
  phonetic?: string;
  partOfSpeech?: string;
  meaningZh?: string;
  level?: string;
  status: EnglishWordStatus;
  dailyBatchDate?: string;
};

type WordCardProps = {
  word: WordSummary;
  showLink?: boolean;
};

export default function WordCard({ word, showLink = true }: WordCardProps) {
  const content = (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl">{word.word}</CardTitle>
          <Badge variant="secondary">
            {ENGLISH_WORD_STATUS_LABELS[word.status] ?? word.status}
          </Badge>
        </div>
        {word.phonetic && (
          <p className="text-sm text-zinc-500">{word.phonetic}</p>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          {word.partOfSpeech && (
            <span className="mr-2 text-zinc-500">{word.partOfSpeech}</span>
          )}
          {word.meaningZh ?? "—"}
        </p>
        {word.level && (
          <p className="mt-2 text-xs text-zinc-400">等级 {word.level}</p>
        )}
      </CardContent>
    </Card>
  );

  if (!showLink) return content;

  return (
    <Link href={`/admin/english/words/${word._id}`} className="block">
      {content}
    </Link>
  );
}
