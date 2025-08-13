import { Metadata } from 'next'
import FormCotizaacionNueva from '../components/FormCotizacionNueva'

export const metadata: Metadata = {
    title: 'Crear Cotización',
}

export default function Page() {
    return (
        <div>
            <FormCotizaacionNueva />
        </div>
    )
}
