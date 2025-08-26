import React from 'react';
import { Metadata } from 'next';
import PipelineManager from './components/PipelineManager';

export const metadata: Metadata = {
    title: 'Gestión de Pipeline',
    description: 'Configuración y gestión de etapas del pipeline de eventos'
};

export default function PipelinePage() {
    return (
        <div className="h-full">
            <PipelineManager />
        </div>
    );
}
