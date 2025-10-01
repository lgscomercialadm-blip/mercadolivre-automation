export default function Home() {
  const loginUrl = "/api/oauth/login";
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-xl w-full text-center space-y-4">
        <h1 className="text-2xl font-semibold">Diagnóstico Mercado Livre</h1>
        <p>Conecte sua conta para coletarmos os dados da conta e anúncios.</p>
        <a
          href={loginUrl}
          className="inline-flex items-center justify-center rounded-md bg-black text-white px-4 py-2"
        >
          Conectar Mercado Livre
        </a>
    </div>
    </main>
  );
}
