export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-fog-gray">
      <main className="flex flex-col items-center gap-6 text-center p-8">
        <h1 className="font-pixel text-2xl text-charcoal">
          CryptoGotchi
        </h1>
        <p className="font-mono text-dark-gray text-lg">
          AI-powered virtual pet coming soon...
        </p>
        <div className="flex gap-3">
          <span className="px-3 py-1 rounded-full bg-peach-sand text-warm-brown text-sm">
            x402
          </span>
          <span className="px-3 py-1 rounded-full bg-sage-mist text-dusty-sage text-sm">
            OWS
          </span>
          <span className="px-3 py-1 rounded-full bg-cream-blush text-caramel text-sm">
            Gemini AI
          </span>
        </div>
      </main>
    </div>
  );
}
