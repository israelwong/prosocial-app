import { Metadata } from 'next'
import ListaCategorias from './components/ListaCategorias'

export const metadata: Metadata = {
    title: 'Lista de servicos'
}

function TareasPage() {
    return (
        <div className='p-5 h-screen'>
            <ListaCategorias />
        </div>
    )
}

export default TareasPage
