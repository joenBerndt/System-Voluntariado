
export const CustomTooltip = ({ active, payload, label }: any) => {
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
