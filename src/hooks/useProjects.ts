import { useMemo } from 'react';
import { useApi } from './useApi';
import { Project } from '../types';

export function useProjects() {
    const { data, loading, error, refetch } = useApi<Project[]>('/projects');

    const projects = useMemo(() => data || [], [data]);

    const publishedProjects = useMemo(() => {
        return projects.filter(p => p.published);
    }, [projects]);

    return {
        projects,
        publishedProjects,
        loading,
        error,
        refetch
    };
}
