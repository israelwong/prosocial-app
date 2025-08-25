/**
 * Utilidad para manejar reintentos en consultas de base de datos
 */

interface RetryOptions {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
}

export async function retryDatabaseOperation<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const { maxRetries = 3, baseDelay = 1000, maxDelay = 5000 } = options;

    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error as Error;

            // Solo reintentar en errores de conexión específicos
            const isRetryableError =
                error instanceof Error && (
                    error.message.includes('database server') ||
                    error.message.includes('P1001') ||
                    error.message.includes('connection') ||
                    error.message.includes('timeout')
                );

            if (!isRetryableError || attempt === maxRetries) {
                throw error;
            }

            // Calcular delay con backoff exponencial
            const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);

            console.warn(`🔄 Reintentando operación de base de datos (intento ${attempt}/${maxRetries}) después de ${delay}ms`);

            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError!;
}
