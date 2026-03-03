import { Skeleton } from "../ui/feedback/skeleton";

export function AdminTableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-64" /> {/* Notification/Filter count simulation */}
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-24 rounded-full" />
                    <Skeleton className="h-8 w-24 rounded-full" />
                </div>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="bg-gray-50 border-b border-gray-200 p-4 grid grid-cols-12 gap-4">
                    <Skeleton className="h-4 w-8 col-span-1" />
                    <Skeleton className="h-4 w-32 col-span-3" />
                    <Skeleton className="h-4 w-24 col-span-2" />
                    <Skeleton className="h-4 w-full col-span-4" />
                    <Skeleton className="h-4 w-16 col-span-2" />
                </div>
                <div className="divide-y divide-gray-100">
                    {Array.from({ length: rows }).map((_, i) => (
                        <div key={i} className="p-4 grid grid-cols-12 gap-4 items-center">
                            <Skeleton className="h-4 w-8 col-span-1" />
                            <div className="col-span-3 space-y-2">
                                <Skeleton className="h-5 w-40" />
                                <Skeleton className="h-3 w-48" />
                            </div>
                            <Skeleton className="h-4 w-24 col-span-2" />
                            <Skeleton className="h-4 w-full col-span-4" />
                            <Skeleton className="h-6 w-20 rounded-full col-span-2" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-8" />
            </div>
        </div>
    );
}

export function StatsSkeleton() {
    return (
        <div className="flex gap-2 mb-6">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-32 rounded-full" />
            <Skeleton className="h-8 w-28 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
        </div>
    )
}

export function DetailPanelSkeleton() {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full"> {/* h-full to match sticky behavior */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                <div className="flex gap-4">
                    <Skeleton className="w-16 h-16 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-5 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-5 w-full" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-16 w-full" />
                </div>
                <div className="flex gap-2 pt-4">
                    <Skeleton className="h-10 flex-1 rounded-lg" />
                    <Skeleton className="h-10 flex-1 rounded-lg" />
                </div>
            </div>
        </div>
    )
}
