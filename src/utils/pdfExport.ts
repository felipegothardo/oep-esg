import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface RecyclingEntry {
  id: string;
  material: string;
  quantity: number;
  co2Saved: number;
  date: string;
}

interface ConsumptionEntry {
  id: string;
  type: 'water' | 'energy';
  month: string;
  cost: number;
  consumption: number;
  date: string;
}

export async function exportToPDF(
  schoolName: string,
  recyclingEntries: RecyclingEntry[],
  consumptionEntries: ConsumptionEntry[],
  chartElement?: HTMLElement | null
) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let currentY = 20;

  // Configurações de estilo
  const primaryColor = { r: 34, g: 197, b: 94 }; // Verde
  const textColor = { r: 31, g: 41, b: 55 }; // Cinza escuro

  // Cabeçalho
  pdf.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Relatório de Sustentabilidade', pageWidth / 2, 20, { align: 'center' });
  
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.text(schoolName, pageWidth / 2, 30, { align: 'center' });

  currentY = 50;

  // Data de geração
  pdf.setTextColor(textColor.r, textColor.g, textColor.b);
  pdf.setFontSize(10);
  pdf.text(`Data de Geração: ${new Date().toLocaleDateString('pt-BR')}`, 15, currentY);
  currentY += 15;

  // Resumo Geral
  const totalCO2 = recyclingEntries.reduce((sum, entry) => sum + entry.co2Saved, 0);
  const totalRecycling = recyclingEntries.reduce((sum, entry) => sum + entry.quantity, 0);
  const totalWaterCost = consumptionEntries
    .filter(e => e.type === 'water')
    .reduce((sum, entry) => sum + entry.cost, 0);
  const totalEnergyCost = consumptionEntries
    .filter(e => e.type === 'energy')
    .reduce((sum, entry) => sum + entry.cost, 0);

  // Caixa de resumo
  pdf.setFillColor(245, 247, 250);
  pdf.roundedRect(15, currentY, pageWidth - 30, 50, 3, 3, 'F');
  
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  pdf.text('Resumo Geral', 20, currentY + 10);
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(textColor.r, textColor.g, textColor.b);
  
  const summaryItems = [
    `CO₂ Evitado: ${totalCO2.toFixed(2)} kg`,
    `Material Reciclado: ${totalRecycling.toFixed(2)} kg`,
    `Custo Total de Água: R$ ${totalWaterCost.toFixed(2)}`,
    `Custo Total de Energia: R$ ${totalEnergyCost.toFixed(2)}`
  ];

  summaryItems.forEach((item, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    pdf.text(item, 20 + (col * 90), currentY + 25 + (row * 10));
  });

  currentY += 60;

  // Adicionar gráfico se fornecido
  if (chartElement) {
    try {
      const canvas = await html2canvas(chartElement, {
        scale: 2,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 30;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      if (currentY + imgHeight > pageHeight - 20) {
        pdf.addPage();
        currentY = 20;
      }
      
      pdf.addImage(imgData, 'PNG', 15, currentY, imgWidth, imgHeight);
      currentY += imgHeight + 10;
    } catch (error) {
      console.error('Erro ao adicionar gráfico:', error);
    }
  }

  // Tabela de Reciclagem
  if (currentY > pageHeight - 60) {
    pdf.addPage();
    currentY = 20;
  }

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  pdf.text('Registros de Reciclagem', 15, currentY);
  currentY += 10;

  // Cabeçalho da tabela
  pdf.setFillColor(240, 242, 245);
  pdf.rect(15, currentY, pageWidth - 30, 8, 'F');
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(textColor.r, textColor.g, textColor.b);
  pdf.text('Data', 20, currentY + 5);
  pdf.text('Material', 60, currentY + 5);
  pdf.text('Quantidade (kg)', 110, currentY + 5);
  pdf.text('CO₂ Evitado (kg)', 160, currentY + 5);
  currentY += 10;

  // Dados da tabela
  pdf.setFont('helvetica', 'normal');
  recyclingEntries.slice(0, 10).forEach((entry) => {
    if (currentY > pageHeight - 20) {
      pdf.addPage();
      currentY = 20;
    }
    pdf.text(entry.date, 20, currentY);
    pdf.text(entry.material, 60, currentY);
    pdf.text(entry.quantity.toString(), 110, currentY);
    pdf.text(entry.co2Saved.toFixed(2), 160, currentY);
    currentY += 7;
  });

  if (recyclingEntries.length > 10) {
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`... e mais ${recyclingEntries.length - 10} registros`, 20, currentY);
    currentY += 10;
  }

  // Tabela de Consumo
  if (currentY > pageHeight - 60) {
    pdf.addPage();
    currentY = 20;
  }

  currentY += 10;
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  pdf.text('Registros de Consumo', 15, currentY);
  currentY += 10;

  // Cabeçalho da tabela de consumo
  pdf.setFillColor(240, 242, 245);
  pdf.rect(15, currentY, pageWidth - 30, 8, 'F');
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(textColor.r, textColor.g, textColor.b);
  pdf.text('Data', 20, currentY + 5);
  pdf.text('Tipo', 50, currentY + 5);
  pdf.text('Mês/Ano', 80, currentY + 5);
  pdf.text('Consumo', 120, currentY + 5);
  pdf.text('Custo (R$)', 160, currentY + 5);
  currentY += 10;

  // Dados da tabela de consumo
  pdf.setFont('helvetica', 'normal');
  consumptionEntries.slice(0, 10).forEach((entry) => {
    if (currentY > pageHeight - 20) {
      pdf.addPage();
      currentY = 20;
    }
    const unit = entry.type === 'water' ? 'L' : 'kWh';
    pdf.text(entry.date, 20, currentY);
    pdf.text(entry.type === 'water' ? 'Água' : 'Energia', 50, currentY);
    pdf.text(entry.month, 80, currentY);
    pdf.text(`${entry.consumption} ${unit}`, 120, currentY);
    pdf.text(`R$ ${entry.cost.toFixed(2)}`, 160, currentY);
    currentY += 7;
  });

  if (consumptionEntries.length > 10) {
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`... e mais ${consumptionEntries.length - 10} registros`, 20, currentY);
  }

  // Rodapé
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text('Relatório gerado pelo OEP Sustentável', pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Salvar o PDF
  pdf.save(`relatorio-${schoolName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
}