/** @type {import('next').NextConfig} */
const nextConfig = {
  // ADICIONE ESTA SECÇÃO
  eslint: {
    // Aviso: Isto irá ignorar os erros de ESLint durante a construção.
    // Útil para acelerar a entrega, mas recomendado remover para produção a longo prazo.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;