"use client";
import { Columns } from "@/components/custom/Columns";
import { DataTable } from "@/components/custom/DataTable";
import { PatentSearchResult } from "@/data/patentDataSchema";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <DataTable<PatentSearchResult, any> columns={Columns} data={[]} />
    </main>
  );
}
