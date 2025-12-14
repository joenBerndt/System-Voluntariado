
import { useMemo, useState, useRef } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    Line, ComposedChart, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { FileText, Users, Megaphone, CheckCircle, AlertCircle, TrendingUp, Activity, Briefcase, Layers, MapPin, Target, LayoutGrid, Award, Zap, Calendar, Printer, Download, Filter, X } from 'lucide-react';
import { useApi, apiPost } from '../../hooks/useApi';
import { LoadingSpinner } from '../LoadingOverlay';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import logoIIAP from '../../assets/30559607b1a3dc361e3c8d4f3f9460064ad9a131.png';

// --- CUSTOM TOOLTIP ---
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 backdrop-blur-md p-4 border border-slate-100 shadow-2xl rounded-xl z-50">
                <p className="font-bold text-gray-800 mb-2 border-b border-gray-100 pb-1">{label || payload[0]?.payload?.name}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm py-1">
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: entry.color || entry.fill }} />
                        <span className="text-gray-600 font-medium">{entry.name}:</span>
                        <span className="font-bold text-gray-900">
                            {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

// --- KPI CARD ---
const KPICard = ({ label, value, icon: Icon, color, trend, trendUp }: any) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-50 rounded-bl-full opacity-50 -mr-4 -mt-4 transition-transform group-hover:scale-110`} />
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <span className={`inline-flex items-center text-xs font-semibold px-2 py-1 rounded-full ${trendUp ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'}`}>
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">{value}</h3>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{label}</p>
            </div>
        </div>
    </div>
);

// --- REPORT CARD COMPONENT ---
const ReportCard = ({
    title, subtitle, icon: Icon, colSpan = "col-span-1", height = 320,
    children,
    filterable = false,
    onFilterChange,
    dataForTable,
    tableColumns,
    uniqueId,
    currentUser,
    logo,
    detailedData, // Optional: Full list of data
    detailedColumns, // Optional: Columns for the detailed list
    onActionLogged // Optional: Callback to refresh logs
}: any) => {
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
        // 1. Log Activity
        if (currentUser) {
            console.log("Logging print action for:", currentUser.id);
            // Using 'user' entity_type to ensure backend acceptance
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
            // Top Bar Background
            pdf.setFillColor(240, 253, 244); // Light Emerald bg
            pdf.rect(0, 0, pageWidth, 30, 'F');

            // Logo
            const logoSize = 16;
            if (logo) {
                try {
                    pdf.addImage(logo, 'PNG', margin, 7, logoSize, logoSize);
                } catch (e) { console.warn("Logo add failed", e); }
            }

            // Institution Name (Top Left)
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(14);
            pdf.setTextColor(6, 78, 59); // Emerald 900
            pdf.text("INSTITUTO DE INVESTIGACIONES DE LA AMAZONÍA PERUANA", margin + logoSize + 5, 13);

            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(9);
            pdf.setTextColor(21, 128, 61); // Emerald 700
            pdf.text("Sistema de Gestión de Voluntariado | Oficina de Cooperación Técnica", margin + logoSize + 5, 18);

            // Report Title Area (Below Header)
            const titleY = 45;
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(22);
            pdf.setTextColor(30, 41, 59); // Slate 800
            pdf.text(title.toUpperCase(), margin, titleY);

            // Metadata (Right side of Title, avoiding overlap)
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(9);
            pdf.setTextColor(100, 116, 139); // Slate 500
            const printDate = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

            // Align metadata to right
            const metaX = pageWidth - margin;
            pdf.text(`Generado: ${printDate}`, metaX, titleY - 6, { align: 'right' });
            pdf.text(`Por: ${currentUser?.name || 'Sistema'}`, metaX, titleY - 1, { align: 'right' });
            if (filterable) pdf.text(`Periodo: ${dateStr}`, metaX, titleY + 4, { align: 'right' });

            // Separator Line
            pdf.setDrawColor(226, 232, 240); // Slate 200
            pdf.setLineWidth(0.5);
            pdf.line(margin, titleY + 10, pageWidth - margin, titleY + 10);

            const contentStartY = titleY + 20;
            const contentWidth = pageWidth - (margin * 2);
            const colGap = 12;
            const colWidth = (contentWidth - colGap) / 2;

            // --- CHART & SUMMARY SECTION ---
            // Determine height based on chart aspect ratio
            const imgProps = pdf.getImageProperties(imgData);
            const aspect = imgProps.height / imgProps.width;
            const pdfImgHeight = colWidth * aspect;

            // Estimate table height
            const rowsCount = (dataForTable || []).length;
            const tableHeightEstimate = 10 + (rowsCount * 8) + 10; // Header + Rows + Padding
            const sectionHeight = Math.max(pdfImgHeight, tableHeightEstimate) + 25;

            // Gray Background Box for Data Panel
            pdf.setFillColor(248, 250, 252); // Slate 50
            pdf.setDrawColor(226, 232, 240); // Slate 200
            pdf.roundedRect(margin, contentStartY, contentWidth, sectionHeight, 3, 3, 'FD');

            // -- Chart Side (Left) --
            // White card behind chart
            pdf.setFillColor(255, 255, 255);
            pdf.roundedRect(margin + 5, contentStartY + 5, colWidth - 5, pdfImgHeight + 10, 2, 2, 'F');
            pdf.addImage(imgData, 'PNG', margin + 5, contentStartY + 10, colWidth - 5, pdfImgHeight);

            // Caption
            pdf.setFontSize(8);
            pdf.setTextColor(148, 163, 184); // Slate 400
            pdf.text("Visualización Gráfica", margin + 5 + (colWidth / 2), contentStartY + pdfImgHeight + 18, { align: 'center' });

            // -- Table Side (Right) --
            const rightColX = margin + colWidth + colGap - 5;
            const tableWidth = colWidth - 5;

            // Table Title
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(11);
            pdf.setTextColor(15, 23, 42); // Slate 900
            pdf.text("RESUMEN DE DATOS", rightColX, contentStartY + 12);

            let currentY = contentStartY + 20;
            const tableHeaders = tableColumns || [];

            if (tableHeaders.length > 0) {
                const cellWidth = tableWidth / tableHeaders.length;

                // Header Bar
                pdf.setFillColor(16, 185, 129); // Emerald 500
                pdf.roundedRect(rightColX, currentY, tableWidth, 9, 1, 1, 'F'); // Header bg

                // Header Text
                pdf.setTextColor(255, 255, 255);
                pdf.setFontSize(8);
                pdf.setFont("helvetica", "bold"); // Bold headers

                tableHeaders.forEach((col: any, i: number) => {
                    // Check for overlap by truncating if needed
                    const headerTxt = col.label.toUpperCase();
                    pdf.text(headerTxt, rightColX + (i * cellWidth) + 3, currentY + 6);
                });
                currentY += 9;

                // Rows
                pdf.setFont("helvetica", "normal");

                (dataForTable || []).forEach((row: any, index: number) => {
                    const isEven = index % 2 === 0;

                    // Row Background
                    pdf.setFillColor(isEven ? 255 : 241, 245, 249); // White or Slate 100
                    pdf.rect(rightColX, currentY, tableWidth, 8, 'F');

                    // Border Bottom
                    pdf.setDrawColor(226, 232, 240); // Slate 200
                    pdf.line(rightColX, currentY + 8, rightColX + tableWidth, currentY + 8);

                    // Text
                    pdf.setTextColor(51, 65, 85); // Slate 700
                    tableHeaders.forEach((col: any, i: number) => {
                        const val = row[col.key];
                        const txt = String(col.format ? col.format(val) : (val !== undefined && val !== null ? val : '-'));
                        // Truncate to prevent overlap
                        const maxLen = 22; // approx chars
                        const cleanTxt = txt.length > maxLen ? txt.substring(0, maxLen - 2) + '...' : txt;
                        pdf.text(cleanTxt, rightColX + (i * cellWidth) + 3, currentY + 5);
                    });

                    currentY += 8;
                });
            }

            // Determine max Y position for next section
            let maxY = contentStartY + sectionHeight + 15;

            // --- DETAILED LIST SECTION (Universal for all charts if detailedData exists) ---
            if (detailedData && detailedData.length > 0 && detailedColumns) {
                // Check if we need a new page immediately
                if (maxY > pageHeight - 60) {
                    pdf.addPage();
                    maxY = 25;
                }

                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(14);
                pdf.setTextColor(6, 78, 59); // Emerald 900
                pdf.text("DETALLE COMPLETO DE REGISTROS", margin, maxY);

                // Line under title
                pdf.setDrawColor(16, 185, 129); // Emerald 500
                pdf.setLineWidth(0.5);
                pdf.line(margin, maxY + 2, margin + 85, maxY + 2);

                maxY += 10;

                // Detailed Table Header
                const dColWidth = contentWidth / detailedColumns.length;

                // Header Bg
                pdf.setFillColor(226, 232, 240); // Slate 200
                pdf.rect(margin, maxY, contentWidth, 10, 'F');

                pdf.setFontSize(8);
                pdf.setFont("helvetica", "bold");
                pdf.setTextColor(71, 85, 105); // Slate 600

                detailedColumns.forEach((col: any, i: number) => {
                    pdf.text(col.header.toUpperCase(), margin + (i * dColWidth) + 4, maxY + 7);
                });
                maxY += 10;

                // Detailed Table Rows
                pdf.setFont("helvetica", "normal");
                pdf.setTextColor(30, 41, 59); // Slate 800

                detailedData.forEach((row: any, index: number) => {
                    // Check page break
                    if (maxY > pageHeight - 25) {
                        pdf.addPage();
                        maxY = 20;
                        // Reprint header
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
                        pdf.setFillColor(250, 250, 250); // Very light gray
                        pdf.rect(margin, maxY, contentWidth, 8, 'F');
                    }

                    detailedColumns.forEach((col: any, i: number) => {
                        const val = row[col.key];
                        // Pass index to formatter for fallback numbering
                        const txt = String(col.format ? col.format(val, row, index) : (val !== undefined && val !== null ? val : ''));
                        // More space for detailed list
                        const cleanTxt = txt.length > 35 ? txt.substring(0, 32) + '...' : txt;
                        pdf.text(cleanTxt, margin + (i * dColWidth) + 4, maxY + 5.5);
                    });

                    // Subtle separator
                    pdf.setDrawColor(241, 245, 249);
                    pdf.line(margin, maxY + 8, pageWidth - margin, maxY + 8);

                    maxY += 8;
                });
            }

            // --- FOOTER ---
            const addFooter = (doc: jsPDF) => {
                const pageCount = doc.getNumberOfPages();
                for (let i = 1; i <= pageCount; i++) {
                    doc.setPage(i);
                    // Footer line
                    doc.setDrawColor(226, 232, 240);
                    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

                    doc.setFontSize(7);
                    doc.setTextColor(148, 163, 184); // Slate 400
                    const footerText = `Instituto de Investigaciones de la Amazonía Peruana  •  Sistema de Gestión de Voluntariado  •  Uso Interno`;
                    doc.text(footerText, margin, pageHeight - 10);
                    doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
                }
            };
            addFooter(pdf);

            // Save
            pdf.save(`${title.replace(/ /g, '_')}_${new Date().getTime()}.pdf`);

        } catch (error: any) {
            console.error("Error generating PDF", error);
            alert(`Error al generar el PDF: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

    return (
        <div className={`${colSpan} bg-white p-6 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 group flex flex-col`}>
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        {Icon && <div className="p-2 bg-gray-50 rounded-lg text-gray-600"><Icon className="w-5 h-5" /></div>}
                        {title}
                    </h3>
                    {subtitle && <p className="text-sm text-gray-400 mt-1 ml-11">{subtitle}</p>}
                </div>

                <div className="flex items-center gap-2">
                    {/* Local Filters */}
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

                    {/* Download Button */}
                    <button onClick={handleDownloadPDF} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Descargar PDF">
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Chart Content */}
            <div ref={chartRef} style={{ width: '100%', height: height, position: 'relative' }}>
                {children}
            </div>
        </div>
    );
};

const EmptyState = ({ message }: { message: string }) => (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-gray-50/30 rounded-xl border-2 border-dashed border-gray-100 backdrop-blur-sm">
        <AlertCircle className="w-10 h-10 mb-2 opacity-40" />
        <p className="text-sm font-medium text-center px-4">{message}</p>
    </div>
);

// --- MAIN COMPONENT ---

export function ReportsAdmin({ currentUser }: { currentUser?: any }) {
    const { data: convocatoriasData, loading: loadingConvocatorias } = useApi<any[]>('/convocatorias');
    const { data: applicationsData, loading: loadingApplications } = useApi<any[]>('/applications');
    const { data: usersData, loading: loadingUsers } = useApi<any[]>('/users');
    const { data: projectsData, loading: loadingProjects } = useApi<any[]>('/projects');
    const { data: logsData, loading: loadingLogs, refetch: refetchLogs } = useApi<any[]>('/activity-logs');

    // State for independent chart filters
    const [activityFilter, setActivityFilter] = useState({ year: new Date().getFullYear().toString(), month: 'all' });
    const [topCovFilter, setTopCovFilter] = useState({ year: new Date().getFullYear().toString(), month: 'all' });
    const [funnelFilter, setFunnelFilter] = useState({ year: new Date().getFullYear().toString(), month: 'all' });
    const [matrixFilter, setMatrixFilter] = useState({ year: new Date().getFullYear().toString(), month: 'all' });

    const isLoading = loadingConvocatorias || loadingApplications || loadingUsers || loadingProjects || loadingLogs;

    // Helpers
    const filterDataByDate = (data: any[], dateField: string, filter: { year: string, month: string }) => {
        if (!data) return [];
        return data.filter(item => {
            if (!item[dateField]) return false;
            const d = new Date(item[dateField]);
            const y = parseInt(filter.year);
            const m = filter.month === 'all' ? null : parseInt(filter.month);

            if (d.getFullYear() !== y) return false;
            if (m !== null && d.getMonth() !== m) return false;
            return true;
        });
    };

    // --- KPI DATA ---
    const kpis = useMemo(() => {
        const totalApps = (applicationsData || []).length;
        const acceptedApps = (applicationsData || []).filter(a => a.status === 'accepted').length;
        const acceptanceRate = totalApps > 0 ? Math.round((acceptedApps / totalApps) * 100) : 0;
        const activeVolunteers = (usersData || []).filter(u => u.role === 'volunteer').length;
        const activeProjects = (projectsData || []).filter(p => p.status === 'activo').length;

        return [
            { label: 'Total Postulaciones', value: totalApps, icon: FileText, color: 'purple', trend: 'Global', trendUp: true },
            { label: 'Tasa de Aceptación', value: `${acceptanceRate}%`, icon: Award, color: 'emerald', trend: 'Global', trendUp: true },
            { label: 'Voluntarios Activos', value: activeVolunteers, icon: Users, color: 'blue', trend: 'Global', trendUp: true },
            { label: 'Proyectos Activos', value: activeProjects, icon: Zap, color: 'amber', trend: 'Global', trendUp: true },
        ];
    }, [usersData, applicationsData, projectsData]);


    // --- CHART DATA ---

    // 1. Activity
    const filteredLogs = useMemo(() => filterDataByDate(logsData || [], 'timestamp', activityFilter), [logsData, activityFilter]);
    const activityData = useMemo(() => {
        const isMonthly = activityFilter.month !== 'all';
        const dataCount: Record<string, number> = {};
        if (isMonthly) {
            const daysInMonth = new Date(parseInt(activityFilter.year), parseInt(activityFilter.month) + 1, 0).getDate();
            for (let i = 1; i <= daysInMonth; i++) dataCount[i] = 0;
            filteredLogs.forEach(log => { const d = new Date(log.timestamp); dataCount[d.getDate()]++; });
        } else {
            const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            months.forEach(m => dataCount[m] = 0);
            filteredLogs.forEach(log => { const d = new Date(log.timestamp); dataCount[months[d.getMonth()]]++; });
        }
        return Object.entries(dataCount).map(([name, val]) => ({ name, Acciones: val }));
    }, [filteredLogs, activityFilter]);

    // 2. Top Covs
    const filteredAppsTop = useMemo(() => filterDataByDate(applicationsData || [], 'appliedDate', topCovFilter), [applicationsData, topCovFilter]);
    const topCovData = useMemo(() => {
        const counts: Record<string, number> = {};
        filteredAppsTop.forEach(app => counts[app.convocatoriaId] = (counts[app.convocatoriaId] || 0) + 1);
        return (convocatoriasData || [])
            .map(c => ({
                name: c.title.length > 20 ? c.title.substring(0, 20) + '...' : c.title,
                fullTitle: c.title,
                Postulantes: counts[c.id] || 0
            }))
            .sort((a, b) => b.Postulantes - a.Postulantes)
            .slice(0, 5);
    }, [filteredAppsTop, convocatoriasData]);

    // 3. Funnel
    const funnelApps = useMemo(() => filterDataByDate(applicationsData || [], 'appliedDate', funnelFilter), [applicationsData, funnelFilter]);
    const funnelUsers = useMemo(() => filterDataByDate(usersData || [], 'created_at', funnelFilter), [usersData, funnelFilter]);
    const funnelData = useMemo(() => {
        return [
            { name: 'Nuevos Reg.', value: funnelUsers.length, fill: '#cbd5e1' },
            { name: 'Postulantes', value: funnelApps.length, fill: '#f59e0b' },
            { name: 'Entrevistas', value: funnelApps.filter(a => a.status.includes('interview')).length, fill: '#8b5cf6' },
            { name: 'Aceptados', value: funnelApps.filter(a => a.status === 'accepted').length, fill: '#10b981' },
        ];
    }, [funnelApps, funnelUsers]);

    // 4. Matrix
    const filteredAppsMatrix = useMemo(() => filterDataByDate(applicationsData || [], 'appliedDate', matrixFilter), [applicationsData, matrixFilter]);
    const matrixData = useMemo(() => {
        return (convocatoriasData || []).map(c => {
            const cApps = filteredAppsMatrix.filter(a => a.convocatoriaId === c.id);
            const accepted = cApps.filter(a => a.status === 'accepted').length;
            return {
                name: c.title,
                x: cApps.length,
                y: accepted,
                z: 100
            };
        }).filter(d => d.x > 0);
    }, [filteredAppsMatrix, convocatoriasData]);

    // Other Datasets
    const userRoleData = useMemo(() => [
        { name: 'Voluntarios', value: (usersData || []).filter(u => u.role === 'volunteer').length, color: '#10b981' },
        { name: 'Candidatos', value: (usersData || []).filter(u => u.role === 'user').length, color: '#3b82f6' },
        { name: 'Admin', value: (usersData || []).filter(u => u.role === 'admin' || u.role === 'admin_master').length, color: '#6366f1' },
    ].filter(i => i.value > 0), [usersData]);

    const statusData = useMemo(() => [
        { name: 'Activas', value: (convocatoriasData || []).filter(c => c.status === 'activa').length, color: '#0ea5e9' },
        { name: 'Cerradas', value: (convocatoriasData || []).filter(c => c.status === 'cerrada').length, color: '#64748b' },
        { name: 'Borrador', value: (convocatoriasData || []).filter(c => c.status === 'borrador').length, color: '#cbd5e1' }
    ].filter(i => i.value > 0), [convocatoriasData]);

    const areaInterestData = useMemo(() => {
        const counts: Record<string, number> = {};
        (convocatoriasData || []).forEach(c => {
            if (c.area) {
                const appCount = (applicationsData || []).filter(a => a.convocatoriaId === c.id).length;
                counts[c.area] = (counts[c.area] || 0) + appCount;
            }
        });
        if (Object.values(counts).reduce((a, b) => a + b, 0) === 0) {
            (convocatoriasData || []).forEach(c => { if (c.area) counts[c.area] = (counts[c.area] || 0) + 1; });
        }
        return Object.entries(counts)
            .map(([area, value]) => ({ subject: area, A: value, fullMark: 100 }))
            .sort((a, b) => b.A - a.A)
            .slice(0, 5);
    }, [convocatoriasData, applicationsData]);

    const offerDemandData = useMemo(() => {
        const activeAreas = Array.from(new Set((convocatoriasData || []).map(c => c.area).filter(Boolean)));
        return activeAreas.map(area => {
            const areaConvocatorias = (convocatoriasData || []).filter(c => c.area === area);
            const convIds = areaConvocatorias.map(c => c.id);
            const areaApps = (applicationsData || []).filter(a => convIds.includes(a.convocatoriaId));
            return { name: area, Oferta: areaConvocatorias.length, Demanda: areaApps.length };
        }).slice(0, 7);
    }, [convocatoriasData, applicationsData]);

    const portfolioData = useMemo(() => [
        { name: 'Activos', count: (projectsData || []).filter(p => p.status === 'activo').length, fill: '#3b82f6' },
        { name: 'Finalizados', count: (projectsData || []).filter(p => p.status === 'finalizado').length, fill: '#10b981' },
        { name: 'Pausados', count: (projectsData || []).filter(p => p.status === 'pausado').length, fill: '#f59e0b' },
    ].filter(a => a.count > 0), [projectsData]);

    if (isLoading) return <LoadingSpinner size="lg" message="Cargando Intelligence..." />;

    // --- DETAILED COLUMNS CONFIG ---
    // User Columns
    const userDetailedColumns = [
        { header: 'Nombre', key: 'name' },
        { header: 'Email', key: 'email' },
        { header: 'Rol', key: 'role', format: (v: string) => v === 'admin' ? 'Adm' : v === 'volunteer' ? 'Vol' : 'Usu' },
        {
            header: 'Registro', key: 'created_at', format: (v: string, row: any) => {
                const d = v || row.createdAt || row.inserted_at;
                return d ? new Date(d).toLocaleDateString('es-PE') : '-';
            }
        }
    ];

    // Convocatoria Columns
    const convDetailedColumns = [
        { header: 'N°/Cod', key: 'code', format: (v: any, row: any, i: number) => v || (i + 1).toString() },
        { header: 'Título', key: 'title' },
        { header: 'Estado', key: 'status' },
        {
            header: 'Fecha', key: 'created_at', format: (v: string, row: any) => {
                const d = v || row.createdAt || row.date || row.inserted_at;
                return d ? new Date(d).toLocaleDateString('es-PE') : '-';
            }
        }
    ];

    // Activity Columns
    const activityDetailedColumns = [
        { header: 'Usuario', key: 'userId', format: (v: string) => (usersData || []).find(u => u.id === v)?.name || 'Sistema' },
        { header: 'Acción', key: 'action' },
        { header: 'Fecha', key: 'timestamp', format: (v: string) => v ? new Date(v).toLocaleString('es-PE') : '-' }
    ];

    // Applications Columns
    const appDetailedColumns = [
        { header: 'Postulante', key: 'userId', format: (v: string) => (usersData || []).find(u => u.id === v)?.name || '?' },
        { header: 'Convocatoria', key: 'convocatoriaId', format: (v: string) => (convocatoriasData || []).find(c => c.id === v)?.title || '?' },
        { header: 'Estado', key: 'status' },
        { header: 'Fecha', key: 'appliedDate', format: (v: string) => v ? new Date(v).toLocaleDateString() : '-' }
    ];

    // Projects Columns
    const projDetailedColumns = [
        { header: 'Proyecto', key: 'name' },
        { header: 'Estado', key: 'status' },
        { header: 'Líder', key: 'leader', format: (v: string) => v || '-' },
        { header: 'Inicio', key: 'start_date', format: (v: string) => v ? new Date(v).toLocaleDateString() : '-' }
    ];


    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Panel de Control</h2>
                    <p className="text-gray-500 mt-1">Análisis de rendimiento y estadísticas</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi, index) => (
                    <KPICard key={index} {...kpi} />
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* 1. User Distribution */}
                <ReportCard
                    title="Base de Usuarios"
                    icon={Users}
                    dataForTable={userRoleData}
                    tableColumns={[{ key: 'name', label: 'Rol' }, { key: 'value', label: 'Usuarios' }]}
                    uniqueId="chart-users"
                    onActionLogged={refetchLogs}
                    currentUser={currentUser}
                    logo={logoIIAP}
                    detailedData={usersData}
                    detailedColumns={userDetailedColumns}
                >
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie data={userRoleData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {userRoleData.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="bottom" iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </ReportCard>

                {/* 2. Convocatorias Status */}
                <ReportCard
                    title="Estado Convocatorias"
                    icon={Megaphone}
                    dataForTable={statusData}
                    tableColumns={[{ key: 'name', label: 'Estado' }, { key: 'value', label: 'Convocatorias' }]}
                    uniqueId="chart-status"
                    onActionLogged={refetchLogs}
                    currentUser={currentUser}
                    logo={logoIIAP}
                    detailedData={convocatoriasData}
                    detailedColumns={convDetailedColumns}
                >
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {statusData.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="bottom" iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </ReportCard>

                {/* 3. Activity Trend */}
                <ReportCard
                    title="Tendencia Actividad"
                    icon={Activity}
                    filterable={true}
                    onFilterChange={setActivityFilter}
                    dataForTable={activityData.filter(d => d.Acciones > 0)}
                    tableColumns={[{ key: 'name', label: 'Día/Mes' }, { key: 'Acciones', label: 'Registros' }]}
                    uniqueId="chart-activity"
                    onActionLogged={refetchLogs}
                    currentUser={currentUser}
                    logo={logoIIAP}
                    detailedData={filteredLogs}
                    detailedColumns={activityDetailedColumns}
                >
                    {activityData.some(d => d.Acciones > 0) ? (
                        <ResponsiveContainer>
                            <AreaChart data={activityData}>
                                <defs>
                                    <linearGradient id="colorActs" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis hide />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="Acciones" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorActs)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : <EmptyState message="Sin actividad en el periodo" />}
                </ReportCard>

                {/* 4. Top Convocatorias */}
                <ReportCard
                    title="Top Convocatorias"
                    icon={TrendingUp}
                    colSpan="lg:col-span-2"
                    filterable={true}
                    onFilterChange={setTopCovFilter}
                    dataForTable={topCovData}
                    tableColumns={[{ key: 'fullTitle', label: 'Convocatoria' }, { key: 'Postulantes', label: 'Interesados' }]}
                    uniqueId="chart-topcov"
                    onActionLogged={refetchLogs}
                    currentUser={currentUser}
                    logo={logoIIAP}
                    detailedData={filteredAppsTop}
                    detailedColumns={appDetailedColumns}
                >
                    {topCovData.some(d => d.Postulantes > 0) ? (
                        <ResponsiveContainer>
                            <BarChart data={topCovData} layout="vertical" margin={{ left: 10, right: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                                <Bar dataKey="Postulantes" radius={[0, 6, 6, 0]} barSize={28}>
                                    {topCovData.map((_, index) => (
                                        <Cell key={index} fill={['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'][index % 5]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <EmptyState message="Sin postulaciones en periodo" />}
                </ReportCard>

                {/* 5. Funnel */}
                <ReportCard
                    title="Embudo Selección"
                    icon={Layers}
                    filterable={true}
                    onFilterChange={setFunnelFilter}
                    dataForTable={funnelData}
                    tableColumns={[{ key: 'name', label: 'Etapa' }, { key: 'value', label: 'Cantidad' }]}
                    uniqueId="chart-funnel"
                    onActionLogged={refetchLogs}
                    currentUser={currentUser}
                    logo={logoIIAP}
                    detailedData={funnelApps}
                    detailedColumns={appDetailedColumns}
                >
                    <ResponsiveContainer>
                        <BarChart data={funnelData} margin={{ top: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                {funnelData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ReportCard>

                {/* 6. Areas Interest */}
                <ReportCard
                    title="Interés por Áreas"
                    subtitle="Top 5 demandadas"
                    icon={MapPin}
                    dataForTable={areaInterestData}
                    tableColumns={[{ key: 'subject', label: 'Área' }, { key: 'A', label: 'Interés' }]}
                    uniqueId="chart-areas"
                    onActionLogged={refetchLogs}
                    currentUser={currentUser}
                    logo={logoIIAP}
                    detailedData={convocatoriasData}
                    detailedColumns={convDetailedColumns}
                >
                    {areaInterestData.length > 0 ? (
                        <ResponsiveContainer>
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={areaInterestData}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                                <Radar name="Interés" dataKey="A" stroke="#ec4899" strokeWidth={3} fill="#ec4899" fillOpacity={0.3} />
                                <Tooltip content={<CustomTooltip />} />
                            </RadarChart>
                        </ResponsiveContainer>
                    ) : <EmptyState message="Sin datos de áreas" />}
                </ReportCard>

                {/* 7. Offer vs Demand */}
                <ReportCard
                    title="Oferta vs Demanda"
                    icon={Briefcase}
                    colSpan="lg:col-span-2"
                    dataForTable={offerDemandData}
                    tableColumns={[{ key: 'name', label: 'Area' }, { key: 'Oferta', label: 'Convocatorias' }, { key: 'Demanda', label: 'Postulantes' }]}
                    uniqueId="chart-offer"
                    onActionLogged={refetchLogs}
                    currentUser={currentUser}
                    logo={logoIIAP}
                    detailedData={convocatoriasData}
                    detailedColumns={convDetailedColumns}
                >
                    <ResponsiveContainer>
                        <ComposedChart data={offerDemandData} margin={{ top: 20 }}>
                            <CartesianGrid stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="name" scale="band" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend iconType="circle" />
                            <Bar dataKey="Oferta" barSize={12} fill="#6366f1" radius={[4, 4, 0, 0]} />
                            <Line type="monotone" dataKey="Demanda" stroke="#f97316" strokeWidth={3} dot={{ r: 4, strokeWidth: 0, fill: '#f97316' }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </ReportCard>

                {/* 8. Portfolio */}
                <ReportCard
                    title="Portafolio Proyectos"
                    icon={LayoutGrid}
                    dataForTable={portfolioData}
                    tableColumns={[{ key: 'name', label: 'Estado' }, { key: 'count', label: 'Proyectos' }]}
                    uniqueId="chart-portfolio"
                    onActionLogged={refetchLogs}
                    currentUser={currentUser}
                    logo={logoIIAP}
                    detailedData={projectsData}
                    detailedColumns={projDetailedColumns}
                >
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie data={portfolioData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="count" cornerRadius={5}>
                                {portfolioData.map((e, i) => <Cell key={i} fill={e.fill} stroke="none" />)}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold text-gray-700">{(projectsData || []).length}</text>
                            <text x="50%" y="62%" textAnchor="middle" dominantBaseline="middle" className="text-[10px] uppercase font-bold text-gray-400">Total</text>
                        </PieChart>
                    </ResponsiveContainer>
                </ReportCard>

                {/* 9. Matrix */}
                <ReportCard
                    title="Matriz Desempeño"
                    icon={Target}
                    colSpan="lg:col-span-2"
                    filterable={true}
                    onFilterChange={setMatrixFilter}
                    dataForTable={matrixData}
                    tableColumns={[{ key: 'name', label: 'Convocatoria' }, { key: 'x', label: 'Postulantes' }, { key: 'y', label: 'Aceptados' }]}
                    uniqueId="chart-matrix"
                    onActionLogged={refetchLogs}
                    currentUser={currentUser}
                    logo={logoIIAP}
                    detailedData={convocatoriasData}
                    detailedColumns={convDetailedColumns}
                >
                    {matrixData.length > 0 ? (
                        <ResponsiveContainer>
                            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis type="number" dataKey="x" name="Postulantes" tick={{ fontSize: 12, fill: '#94a3b8' }} tickLine={false} axisLine={false} label={{ value: 'Postulantes', position: 'bottom', offset: 0, fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis type="number" dataKey="y" name="Aceptados" tick={{ fontSize: 12, fill: '#94a3b8' }} tickLine={false} axisLine={false} label={{ value: 'Aceptados', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 12 }} />
                                <ZAxis type="number" dataKey="z" range={[100, 500]} />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                                <Scatter name="Convocatorias" data={matrixData} fill="#f43f5e">
                                    {matrixData.map((_, i) => <Cell key={i} fill={['#f43f5e', '#ec4899', '#d946ef', '#a855f7'][i % 4]} />)}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    ) : <EmptyState message="Sin datos en el periodo" />}
                </ReportCard>

            </div>
        </div>
    );
}
