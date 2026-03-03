import { AlertCircle } from 'lucide-react';

export const EmptyState = ({ message }: { message: string }) => (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-gray-50/30 rounded-xl border-2 border-dashed border-gray-100 backdrop-blur-sm">
        <AlertCircle className="w-10 h-10 mb-2 opacity-40" />
        <p className="text-sm font-medium text-center px-4">{message}</p>
    </div>
);
