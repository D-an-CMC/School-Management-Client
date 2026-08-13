export default function Home() {
  return (
    <main className="flex items-center justify-center min-h-screen">
      <form className="flex flex-col gap-3 w-full max-w-sm" onSubmit={(e) => e.preventDefault()}>
        <input
          className="border rounded px-3 py-2 text-black"
          placeholder="Enter your name"
          type="text"
        />
        <button type="submit" className="rounded bg-black px-4 py-2 text-white">
          Say hello
        </button>
      </form>
    </main>
  );
}
