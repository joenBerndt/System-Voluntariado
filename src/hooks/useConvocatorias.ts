import { useMemo } from 'react';
import { useApi } from './useApi';
import { Convocatoria } from '../types';

export function useConvocatorias() {
    const { data, loading, error, refetch } = useApi<Convocatoria[]>('/convocatorias');

    const convocatorias = useMemo(() => data || [], [data]);

    const activeConvocatorias = useMemo(() => {
        return convocatorias.filter(c => c.status === 'activa');
    }, [convocatorias]);

    return {
        convocatorias,
        activeConvocatorias,
        loading,
        error,
        refetch
    };
}
