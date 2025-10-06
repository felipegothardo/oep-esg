import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { generatePDF } from "@/utils/pdfExport";

interface ExportData {
  headers: string[];
  rows: any[][];
  filename: string;
}

interface ExportOptionsProps {
  data: ExportData;
  title?: string;
}

export function ExportOptions({ data, title = "Exportar Dados" }: ExportOptionsProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const exportToCSV = () => {
    setLoading("csv");
    try {
      const csvContent = [
        data.headers.join(","),
        ...data.rows.map(row => row.join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      link.setAttribute("href", url);
      link.setAttribute("download", `${data.filename}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Exportado com sucesso!",
        description: "Arquivo CSV baixado.",
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível gerar o arquivo CSV.",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const exportToExcel = () => {
    setLoading("excel");
    try {
      // Simple TSV format that Excel can open
      const tsvContent = [
        data.headers.join("\t"),
        ...data.rows.map(row => row.join("\t"))
      ].join("\n");

      const blob = new Blob([tsvContent], { type: "application/vnd.ms-excel" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      link.setAttribute("href", url);
      link.setAttribute("download", `${data.filename}.xls`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Exportado com sucesso!",
        description: "Arquivo Excel baixado.",
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível gerar o arquivo Excel.",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const exportToPDF = async () => {
    setLoading("pdf");
    try {
      await generatePDF(data.headers, data.rows, data.filename);
      toast({
        title: "Exportado com sucesso!",
        description: "Arquivo PDF baixado.",
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível gerar o arquivo PDF.",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            onClick={exportToCSV}
            disabled={loading !== null}
            variant="outline"
            className="hover-scale"
          >
            {loading === "csv" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            CSV
          </Button>

          <Button
            onClick={exportToExcel}
            disabled={loading !== null}
            variant="outline"
            className="hover-scale"
          >
            {loading === "excel" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="mr-2 h-4 w-4" />
            )}
            Excel
          </Button>

          <Button
            onClick={exportToPDF}
            disabled={loading !== null}
            variant="outline"
            className="hover-scale"
          >
            {loading === "pdf" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
