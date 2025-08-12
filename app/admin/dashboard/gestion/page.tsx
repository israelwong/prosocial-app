import React from 'react';
import { Metadata } from 'next';
import KanbanBoard from './components/KanbanBoard';

export const metadata: Metadata = {
    title: 'Gestión de Pipeline',
    description: 'Vista kanban para gestionar el pipeline de eventos'
};

export default function GestionPage() {
    return (
        <div className="h-full">
            <KanbanBoard />
        </div>
    );
}
