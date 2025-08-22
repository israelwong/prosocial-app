import React from 'react';
import GestorGastosAvanzado from './components/GestorGastosAvanzado';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Gastos - Dashboard Financiero',
    description: 'Gestión avanzada de gastos operativos'
};

export default function GastosPage() {
    return (
        <div className="container mx-auto py-6">
            <GestorGastosAvanzado />
        </div>
    );
}
