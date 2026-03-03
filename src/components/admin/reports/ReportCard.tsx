import { useState, useRef } from 'react';
import { Download } from 'lucide-react';
import { apiPost } from '../../../hooks/useApi';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import logoDefault from '../../../assets/30559607b1a3dc361e3c8d4f3f9460064ad9a131.png';

interface ReportCardProps {
    title: string;
    subtitle?: string;
    icon?: any;
    colSpan?: string;
    height?: number;
    children: React.ReactNode;
    filterable?: boolean;
    onFilterChange?: (filter: { year: string; month: string }) => void;
    dataForTable?: any[];
    tableColumns?: { key: string; label: string; format?: (v: any) => string }[];
    uniqueId: string;
    currentUser?: any;
    logo?: string;
    detailedData?: any[];
    detailedColumns?: any[];
    onActionLogged?: () => void;
}

export const ReportCard = ({
    title, subtitle, icon: Icon, colSpan = "col-span-1", height = 320,
    children,
    filterable = false,
    onFilterChange,
    dataForTable,
    tableColumns,
    uniqueId,
    currentUser,
    logo = logoDefault,
    detailedData,
    detailedColumns,
    onActionLogged
}: ReportCardProps) => {
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [month, setMonth] = useState('all');
    const chartRef = useRef<HTMLDivElement>(null);

    const handleYearChange = (e: any) => {
        const val = e.target.value;
        setYear(val);
        if (onFilterChange) onFilterChange({ year: val, month });
    };

    const handleMonthChange = (e: any) => {
        const val = e.target.value;
        setMonth(val);
        if (onFilterChange) onFilterChange({ year, month: val });
    };

    const handleDownloadPDF = async () => {
        if (!chartRef.current) return;

        // 1. Log Activity
        if (currentUser) {
            console.log("Logging print action for:", currentUser.id);
            apiPost('/activity-logs', {
                action: 'Descarga PDF',
                description: `Reporte generado: ${title}`,
                user_id: currentUser.id,
                entity_type: 'user',
                details: JSON.stringify({ year, month, title, timestamp: new Date().toISOString() }),
                metadata: { year, month, title, timestamp: new Date().toISOString() }
            })
                .then((res) => {
                    console.log("Activity logged successfully:", res);
                    if (onActionLogged) onActionLogged();
                })
                .catch(e => console.error("Failed to log activity:", e));
        }

        const dateStr = month !== 'all'
            ? `${new Date(parseInt(year), parseInt(month)).toLocaleString('es-ES', { month: 'long', year: 'numeric' })}`
            : year;

        try {
            // 2. Capture Chart Image using html-to-image
            const imgData = await toPng(chartRef.current, { cacheBust: true, backgroundColor: '#ffffff', pixelRatio: 2 });

            if (!imgData || imgData === 'data:,') {
                throw new Error("No se pudo generar la imagen del gráfico");
            }

            // 3. Initialize PDF
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 15;

            // --- HEADER DESIGN ---
            pdf.setFillColor(240, 253, 244); // Light Emerald bg
            pdf.rect(0, 0, pageWidth, 30, 'F');

            const logoSize = 16;
            if (logo) {
                try {
                    pdf.addImage(logo, 'PNG', margin, 7, logoSize, logoSize);
                } catch (e) { console.warn("Logo add failed", e); }
            }

            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(14);
            pdf.setTextColor(6, 78, 59); // Emerald 900
            pdf.text("INSTITUTO DE INVESTIGACIONES DE LA AMAZONÍA PERUANA", margin + logoSize + 5, 13);

            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(9);
            pdf.setTextColor(21, 128, 61); // Emerald 700
            pdf.text("Sistema de Gestión de Voluntariado | Oficina de Cooperación Técnica", margin + logoSize + 5, 18);

            const titleY = 45;
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(22);
            pdf.setTextColor(30, 41, 59); // Slate 800
            pdf.text(title.toUpperCase(), margin, titleY);

            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(9);
            pdf.setTextColor(100, 116, 139); // Slate 500
            const printDate = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

            const metaX = pageWidth - margin;
            pdf.text(`Generado: ${printDate}`, metaX, titleY - 6, { align: 'right' });
            pdf.text(`Por: ${currentUser?.name || 'Sistema'}`, metaX, titleY - 1, { align: 'right' });
            if (filterable) pdf.text(`Periodo: ${dateStr}`, metaX, titleY + 4, { align: 'right' });

            pdf.setDrawColor(226, 232, 240);
            pdf.setLineWidth(0.5);
            pdf.line(margin, titleY + 10, pageWidth - margin, titleY + 10);

            const contentStartY = titleY + 20;
            const contentWidth = pageWidth - (margin * 2);
            const colGap = 12;
            const colWidth = (contentWidth - colGap) / 2;

            const imgProps = pdf.getImageProperties(imgData);
            const aspect = imgProps.height / imgProps.width;
            const pdfImgHeight = colWidth * aspect;

            const rowsCount = (dataForTable || []).length;
            const tableHeightEstimate = 10 + (rowsCount * 8) + 10;
            const sectionHeight = Math.max(pdfImgHeight, tableHeightEstimate) + 25;

            pdf.setFillColor(248, 250, 252);
            pdf.setDrawColor(226, 232, 240);
            pdf.roundedRect(margin, contentStartY, contentWidth, sectionHeight, 3, 3, 'FD');

            pdf.setFillColor(255, 255, 255);
            pdf.roundedRect(margin + 5, contentStartY + 5, colWidth - 5, pdfImgHeight + 10, 2, 2, 'F');
            pdf.addImage(imgData, 'PNG', margin + 5, contentStartY + 10, colWidth - 5, pdfImgHeight);

            pdf.setFontSize(8);
            pdf.setTextColor(148, 163, 184);
            pdf.text("Visualización Gráfica", margin + 5 + (colWidth / 2), contentStartY + pdfImgHeight + 18, { align: 'center' });

            const rightColX = margin + colWidth + colGap - 5;
            const tableWidth = colWidth - 5;

            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(11);
            pdf.setTextColor(15, 23, 42);
            pdf.text("RESUMEN DE DATOS", rightColX, contentStartY + 12);

            let currentY = contentStartY + 20;
            const tableHeaders = tableColumns || [];

            if (tableHeaders.length > 0) {
                const cellWidth = tableWidth / tableHeaders.length;

                pdf.setFillColor(16, 185, 129);
                pdf.roundedRect(rightColX, currentY, tableWidth, 9, 1, 1, 'F');

                pdf.setTextColor(255, 255, 255);
                pdf.setFontSize(8);
                pdf.setFont("helvetica", "bold");

                tableHeaders.forEach((col: any, i: number) => {
                    const headerTxt = col.label.toUpperCase();
                    pdf.text(headerTxt, rightColX + (i * cellWidth) + 3, currentY + 6);
                });
                currentY += 9;

                pdf.setFont("helvetica", "normal");

                (dataForTable || []).forEach((row: any, index: number) => {
                    const isEven = index % 2 === 0;

                    pdf.setFillColor(isEven ? 255 : 241, 245, 249);
                    pdf.rect(rightColX, currentY, tableWidth, 8, 'F');

                    pdf.setDrawColor(226, 232, 240);
                    pdf.line(rightColX, currentY + 8, rightColX + tableWidth, currentY + 8);

                    pdf.setTextColor(51, 65, 85);
                    tableHeaders.forEach((col: any, i: number) => {
                        const val = row[col.key];
                        const txt = String(col.format ? col.format(val) : (val !== undefined && val !== null ? val : '-'));
                        const maxLen = 22;
                        const cleanTxt = txt.length > maxLen ? txt.substring(0, maxLen - 2) + '...' : txt;
                        pdf.text(cleanTxt, rightColX + (i * cellWidth) + 3, currentY + 5);
                    });

                    currentY += 8;
                });
            }

            let maxY = contentStartY + sectionHeight + 15;

            if (detailedData && detailedData.length > 0 && detailedColumns) {
                if (maxY > pageHeight - 60) {
                    pdf.addPage();
                    maxY = 25;
                }

                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(14);
                pdf.setTextColor(6, 78, 59);
                pdf.text("DETALLE COMPLETO DE REGISTROS", margin, maxY);

                pdf.setDrawColor(16, 185, 129);
                pdf.setLineWidth(0.5);
                pdf.line(margin, maxY + 2, margin + 85, maxY + 2);

                maxY += 10;

                const dColWidth = contentWidth / detailedColumns.length;

                pdf.setFillColor(226, 232, 240);
                pdf.rect(margin, maxY, contentWidth, 10, 'F');

                pdf.setFontSize(8);
                pdf.setFont("helvetica", "bold");
                pdf.setTextColor(71, 85, 105);

                detailedColumns.forEach((col: any, i: number) => {
                    pdf.text(col.header.toUpperCase(), margin + (i * dColWidth) + 4, maxY + 7);
                });
                maxY += 10;

                pdf.setFont("helvetica", "normal");
                pdf.setTextColor(30, 41, 59);

                detailedData.forEach((row: any, index: number) => {
                    if (maxY > pageHeight - 25) {
                        pdf.addPage();
                        maxY = 20;
                        pdf.setFillColor(226, 232, 240);
                        pdf.rect(margin, maxY, contentWidth, 10, 'F');
                        pdf.setFont("helvetica", "bold");
                        detailedColumns.forEach((col: any, i: number) => {
                            pdf.text(col.header.toUpperCase(), margin + (i * dColWidth) + 4, maxY + 7);
                        });
                        pdf.setFont("helvetica", "normal");
                        maxY += 10;
                    }

                    if (index % 2 === 0) {
                        pdf.setFillColor(250, 250, 250);
                        pdf.rect(margin, maxY, contentWidth, 8, 'F');
                    }

                    detailedColumns.forEach((col: any, i: number) => {
                        const val = row[col.key];
                        const txt = String(col.format ? col.format(val, row, index) : (val !== undefined && val !== null ? val : ''));
                        const cleanTxt = txt.length > 35 ? txt.substring(0, 32) + '...' : txt;
                        pdf.text(cleanTxt, margin + (i * dColWidth) + 4, maxY + 5.5);
                    });

                    pdf.setDrawColor(241, 245, 249);
                    pdf.line(margin, maxY + 8, pageWidth - margin, maxY + 8);

                    maxY += 8;
                });
            }

            const addFooter = (doc: jsPDF) => {
                const pageCount = doc.getNumberOfPages();
                for (let i = 1; i <= pageCount; i++) {
                    doc.setPage(i);
                    doc.setDrawColor(226, 232, 240);
                    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
                    doc.setFontSize(7);
                    doc.setTextColor(148, 163, 184);
                    doc.text(`Instituto de Investigaciones de la Amazonía Peruana  •  Sistema de Gestión de Voluntariado  •  Uso Interno`, margin, pageHeight - 10);
                    doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
                }
            };
            addFooter(pdf);

            pdf.save(`${title.replace(/ /g, '_')}_${new Date().getTime()}.pdf`);

        } catch (error: any) {
            console.error("Error generating PDF", error);
            alert(`Error al generar el PDF: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

    return (
        <div className={`${colSpan} bg-white p-6 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 group flex flex-col`}>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        {Icon && <div className="p-2 bg-gray-50 rounded-lg text-gray-600"><Icon className="w-5 h-5" /></div>}
                        {title}
                    </h3>
                    {subtitle && <p className="text-sm text-gray-400 mt-1 ml-11">{subtitle}</p>}
                </div>

                <div className="flex items-center gap-2">
                    {filterable && (
                        <div className="flex bg-gray-50 rounded-lg p-1 border border-gray-200">
                            <select value={year} onChange={handleYearChange} className="bg-transparent border-none text-xs font-medium focus:ring-0 py-1 px-1 cursor-pointer">
                                {Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i).map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                            <div className="w-px bg-gray-300 my-1 mx-1"></div>
                            <select value={month} onChange={handleMonthChange} className="bg-transparent border-none text-xs font-medium focus:ring-0 py-1 px-1 cursor-pointer w-[60px]">
                                <option value="all">Año</option>
                                {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'].map((m, i) => <option key={i} value={i}>{m}</option>)}
                            </select>
                        </div>
                    )}

                    <button onClick={handleDownloadPDF} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Descargar PDF">
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div ref={chartRef} style={{ width: '100%', height: height, position: 'relative' }}>
                {children}
            </div>
        </div>
    );
};
