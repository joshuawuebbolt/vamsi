import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-50 px-16 bg-white dark:bg-black sm:items-start">
        <header className="w-full">
          <div className="flex items-center gap-4">
            <Image
              className="dark:invert"
              src="/mentor.png"
              alt="Mentor logo"
              width={100}
              height={20}
              priority
            />
            <h2 className="text-3xl sm:text-4xl font-bold text-black dark:text-zinc-50">
              Vamsi
            </h2>
          </div>
        </header>
        
        <div>
          {/* Next Button with Counter */}
            <div className="w-full py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
              id="next-btn"
              className="flex h-12 items-center justify-center rounded-full bg-foreground px-5 text-background hover:bg-[#383838] dark:hover:bg-[#ccc]"
              type="button"
              >
              Next
              </button>
              <span id="next-count" suppressHydrationWarning={true} className="text-lg font-medium text-zinc-700 dark:text-zinc-300">Question 0</span>
            </div>

            <script
              dangerouslySetInnerHTML={{
              __html: `
              (function(){
                const btn = document.getElementById('next-btn');
                const out = document.getElementById('next-count');
                if (!btn || !out) return;
                let count = parseInt(localStorage.getItem('next_count') || '0', 10) || 0;
                out.textContent = 'Question ' + String(count);
                btn.addEventListener('click', function () {
                count += 1;
                localStorage.setItem('next_count', String(count));
                out.textContent = 'Question ' + String(count);
                });
              })();
              `,
              }}
            />
            </div>


          {/* Summarize */} 
        <div className="w-full">
        <button
          id="summarize-btn"
          className="flex h-12 items-center justify-center rounded-full bg-foreground px-5 text-background hover:bg-[#383838] dark:hover:bg-[#ccc]"
          type="button"
        >
          Summarize
        </button>

        <div
          id="summarize-output"
          className="mt-4 max-w-prose whitespace-pre-wrap rounded-md bg-zinc-50 p-10 text-sm text-zinc-700 dark:bg-neutral-900 dark:text-zinc-300"
          aria-live="polite"
        />

        <script
          dangerouslySetInnerHTML={{
          __html: `
          (function(){
            const btn = document.getElementById('summarize-btn');
            const out = document.getElementById('summarize-output');
            if (!btn || !out) return;

            btn.addEventListener('click', async function () {
            btn.disabled = true;
            const prev = btn.innerHTML;
            btn.textContent = 'Loading...';
            out.textContent = '';

            try {
          const res = await fetch('/api/summarize');
          if (!res.ok) throw new Error('Request failed with status ' + res.status);
          const data = await res.json();
          const summary = data?.summary ?? (typeof data === 'string' ? data : JSON.stringify(data, null, 2));
          out.textContent = summary;
            } catch (err) {
          out.textContent = 'Errorrrrrrrrrrrr: ' + (err && err.message ? err.message : String(err)) + ' This is just for testing to show what a summary might look like if we had one. In the real implementation, this would be replaced with actual summary data.';
            } finally {
          btn.disabled = false;
          btn.innerHTML = prev;
            }
            });
          })();
          `,
          }}
        />
        </div>
        </div>
      </main>
    </div>
  );
}
