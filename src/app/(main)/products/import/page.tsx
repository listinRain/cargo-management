"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { ArrowLeft, Upload } from "lucide-react";

export default function ImportProductsPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/products/import", { method: "POST", body: formData });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setResult(data.message || `成功导入 ${data.created} 个货物`);
    } else {
      setResult(data.error || "导入失败");
    }
  };

  return (
    <div>
      <PageHeader title="导入货物" description="上传 Excel 文件批量导入货物">
        <Button variant="outline" size="sm" onClick={() => router.back()}><ArrowLeft className="h-4 w-4 mr-1" />返回</Button>
      </PageHeader>
      <Card className="max-w-md">
        <CardHeader><CardTitle className="text-lg">上传文件</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input type="file" accept=".xlsx,.xls" onChange={e => setFile(e.target.files?.[0] || null)} />
          <p className="text-xs text-muted-foreground">支持 .xlsx / .xls 格式。表头支持：名称、编码、规格、单位、单价、最低库存、最高库存、初始数量、仓库、库位。</p>
          <Button onClick={handleImport} disabled={!file || loading}>
            <Upload className="h-4 w-4 mr-1" />{loading ? "导入中..." : "开始导入"}
          </Button>
          {result && <p className="text-sm font-medium">{result}</p>}
        </CardContent>
      </Card>
    </div>
  );
}

// Keep Input import but use native input
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    />
  );
}
