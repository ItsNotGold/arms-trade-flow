import React from 'react';
import { ExternalLink } from 'lucide-react';
export default function MethodologyPage() {
  const lastUpdated = new Date().toLocaleDateString();

  return (
    <div className="flex justify-center px-4 py-8 bg-[#0d101e] min-h-screen">
      <article className="prose prose-invert max-w-[760px] text-text-primary leading-[1.8] text-base">
        <h1 className="text-3xl font-bold text-center mb-6">Methodology</h1>

        {/* 1. ABOUT THIS PROJECT */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">About This Project</h2>
          <p>
            This visualiser provides an interactive, side‑by‑side view of conventional arms‑trade flows around the globe. It is
            open‑source, built for researchers, journalists, policy‑makers and anyone interested in the dynamics of global defence
            commerce.
          </p>
        </section>

        {/* 2. PRIMARY DATA SOURCE */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">Primary Data Source: SIPRI Arms Transfers Database</h2>
          <p>
            <strong>Stockholm International Peace Research Institute (SIPRI)</strong> maintains the world’s most comprehensive
            database of conventional weapons transfers. The institute gathers data from official government reports, reputable
            news outlets and specialised defence publications.
          </p>
          <p>
            <strong>Trend Indicator Value (TIV)</strong> is the metric SIPRI uses. It is a weighted estimate of a weapon system’s
            overall capability (size, fire‑power, range, etc.) and enables comparison across very different categories. TIV is
            preferred over nominal USD values because many arms deals lack transparent price information.
          </p>
          <p><strong>Limitations of TIV</strong>:</p>
          <ul className="list-disc list-inside ml-4">
            <li>Does not represent the actual financial value of a transaction.</li>
            <li>Excludes small arms, ammunition and many low‑technology items.</li>
            <li>Relies only on publicly available sources; classified or undisclosed deals are omitted.</li>
          </ul>
          <p>
            Weapon categories captured include aircraft, armoured vehicles, artillery, missiles, ships, sensors and other
            major systems. Spare parts, training services and logistical support are not recorded.
          </p>
          <p>
            <a href="https://www.sipri.org/databases/armstransfers" target="_blank" rel="noopener noreferrer"
               className="text-accent underline hover:text-accent-light">
              Official SIPRI Arms Transfers Database
            </a>
          </p>
        </section>



        {/* 4. KNOWN GAPS & LIMITATIONS */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">Known Gaps & Limitations</h2>
          <blockquote className="border-l-4 border-accent pl-4 italic text-text-muted">
            • Secret or classified transfers are not captured in SIPRI.<br />
            • Small arms and light weapons are largely excluded.<br />
            • Licensed production and domestic refurbishments are inconsistently reported.<br />

            • TIV is a volume metric, not a monetary one.
          </blockquote>
        </section>

        {/* 6. UPDATE SCHEDULE */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">Update Schedule</h2>
          <p>SIPRI data are refreshed annually each March. This tool was last updated: <strong>{lastUpdated}</strong>.</p>
        </section>

        {/* 7. CONTACT & CONTRIBUTE */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">Contact &amp; Contribute</h2>
          <p>
            The project is hosted on GitHub. Feel free to open issues, submit pull‑requests or suggest improvements.
          </p>
          <p>
            <a href="https://github.com/ItsNotGold/Weapons-tracker" target="_blank" rel="noopener noreferrer"
               className="text-accent underline hover:text-accent-light flex items-center gap-1">
              <ExternalLink size={16} /> GitHub Repository
            </a>
          </p>
          <p>Contributions such as country‑data corrections, translations or UI enhancements are warmly welcome.</p>
        </section>
      </article>
    </div>
  );
}
