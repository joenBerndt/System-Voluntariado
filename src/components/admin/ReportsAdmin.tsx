import { useMemo, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area, ComposedChart, Line, ScatterChart, Scatter, ZAxis,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { FileText, Users, Megaphone, TrendingUp, Activity, Layers, Award, Zap, LayoutGrid, Target, Briefcase, MapPin, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { LoadingSpinner } from '../common/LoadingOverlay';
import logoIIAP from '../../assets/30559607b1a3dc361e3c8d4f3f9460064ad9a131.png';
import { KPICard } from './reports/KPICard';
import { ReportCard } from './reports/ReportCard';
import { CustomTooltip } from './reports/CustomTooltip';
import { EmptyState } from './reports/EmptyState';

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
