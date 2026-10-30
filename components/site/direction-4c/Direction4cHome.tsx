import Link from "next/link";
import Image from "next/image";
import "./clear-home.css";
import { AssemblyHero } from "./AssemblyHero";
const links = [
  ["Customer journeys", "/assembling"],
  ["Studio", "/studio"],
  ["Lab", "/lab"],
  ["Website check", "/ai-ready"],
];
export function Direction4cHome() {
  return (
    <div className="clear-home">
      <Link className="home-skip" href="#main">
        Skip to content
      </Link>
      <header className="home-nav">
        <Link className="home-brand" href="/" aria-label="assembl home">
          <Image
            src="/direction-4c/assets/brand/assembl-a-glass.webp"
            alt=""
            width="42"
            height="42"
          />
          assembl
        </Link>
        <nav aria-label="Primary">
          {links.map(([label, href]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <Link className="home-button" href="/contact">
          Bring us the work ↗
        </Link>
      </header>
      <main id="main">
        <section className="home-hero">
          <div className="home-hero-copy">
            <p className="home-kicker">MAHI THAT EARNS ITS PROOF · AOTEAROA</p>
            <h1>
              Make the next
              <br />
              step{" "}
              <span>
                worth
                <br className="home-break" /> waiting for.
              </span>
            </h1>
            <p>
              Turn necessary customer waiting into useful, permissioned
              preparation. A better brief. A clearer choice. A person in
              control.
            </p>
            <div className="home-actions">
              <Link className="home-button" href="/ai-ready">
                Find your first opportunity ↗
              </Link>
              <Link className="home-text-link" href="#work">
                See what that looks like ↓
              </Link>
            </div>
          </div>
          <AssemblyHero />
        </section>
        <section className="home-proof">
          <p>
            Something is happening.
            <br />
            <strong>Make the moment useful.</strong>
          </p>
          <ol>
            <li>
              <b>01</b>
              <span>A real customer wait</span>
            </li>
            <li>
              <b>02</b>
              <span>One useful, optional action</span>
            </li>
            <li>
              <b>03</b>
              <span>A reviewed next step</span>
            </li>
            <li>
              <b>04</b>
              <span>Evidence of what happened</span>
            </li>
          </ol>
        </section>
        <section className="home-work" id="work">
          <div className="home-section-head">
            <div>
              <p className="home-kicker">EXPERIENCE THE POSSIBILITY</p>
              <h2>
                Less explaining.
                <br />
                More <span>showing.</span>
              </h2>
            </div>
            <p>
              Working demonstrators make an idea easier to judge. Explore the
              interaction, then decide what belongs in your business.
            </p>
          </div>
          <div className="home-work-grid">
            <Link
              className="home-work-card"
              href="https://assembl-lab.vercel.app/whaiao-story/"
            >
              <div className="home-work-image">
                <Image
                  src="/images/site/whaiao-pavilion.jpg"
                  alt="Blender-rendered illustrative courtyard pavilion"
                  width="1800"
                  height="1100"
                  loading="lazy"
                />
              </div>
              <div>
                <small>ARCHITECTURE · INDEPENDENT DEMONSTRATOR</small>
                <h3>A project, opened up. ↗</h3>
                <p>
                  Explore spaces, discuss options and keep the conversation
                  together after a hui. Illustrative architecture, not an
                  approved Whaiao project.
                </p>
              </div>
            </Link>
            <Link
              className="home-work-card"
              href="https://assembl-lab.vercel.app/study/patterns/"
            >
              <div className="home-work-image home-studio-preview">
                <Image
                  src="/images/site/living-studio.jpg"
                  alt="A cobalt sculpture poster exported from Living Studio"
                  width="1200"
                  height="900"
                  loading="lazy"
                />
              </div>
              <div>
                <small>CREATIVE TOOL · MADE IN YOUR BROWSER</small>
                <h3>Your colours. Your creation. ↗</h3>
                <p>
                  Sculpt a form, tune its finish and make a shareable piece of
                  your own. No account needed.
                </p>
              </div>
            </Link>
          </div>
        </section>
        <section className="home-check">
          <div>
            <p className="home-kicker">START WITH YOUR OWN BUSINESS</p>
            <h2>
              See what to fix.
              <br />
              <span>Imagine what comes next.</span>
            </h2>
            <p>
              A public website check, useful implementation steps and a visual
              concept for your customer journey. Yours to download and discuss
              with your team.
            </p>
            <Link className="home-button" href="/ai-ready">
              Get your website action plan ↗
            </Link>
          </div>
          <div
            className="home-plan-preview"
            aria-label="Example action plan, illustrative"
          >
            <small>YOUR BUSINESS / PREPARED DRAFT</small>
            <h3>
              A useful
              <br />
              next step.
            </h3>
            <div>
              <b>01 / Foundations</b>
              <p>Clear information. Accessible content.</p>
            </div>
            <div>
              <b>02 / Possibility</b>
              <p>One customer moment worth improving.</p>
            </div>
            <div>
              <b>03 / Proof</b>
              <p>A small pilot. A named reviewer.</p>
            </div>
            <span>EXAMPLE · YOUR PLAN USES YOUR FINDINGS</span>
          </div>
        </section>
        <section className="home-system">
          <div className="home-section-head">
            <div>
              <p className="home-kicker">THE WORK BEHIND THE EXPERIENCE</p>
              <h2>
                Find it. Prepare it.
                <br />
                <span>Make it tangible.</span>
              </h2>
            </div>
            <Link className="home-text-link" href="/assembling">
              Explore active customer journeys ↗
            </Link>
          </div>
          <div className="home-system-grid">
            <Link href="/pursuit">
              <small>01 / PURSUIT</small>
              <h3>Find the work. ↗</h3>
              <p>
                Explore signals and opportunities that could become a useful
                next step.
              </p>
            </Link>
            <Link href="/do">
              <small>02 / DO</small>
              <h3>Prepare the work. ↗</h3>
              <p>
                Start with a task. Review the prepared work and choose what
                happens next.
              </p>
            </Link>
            <Link href="/studio">
              <small>03 / STUDIO</small>
              <h3>Show the possibility. ↗</h3>
              <p>
                Turn a brief into an interactive journey, visual story or
                working demonstrator.
              </p>
            </Link>
          </div>
        </section>
        <section className="home-close">
          <p className="home-kicker">START SMALL. EARN THE PROOF.</p>
          <h2>
            One real wait.
            <br />
            One better next step.
          </h2>
          <p>
            Bring a customer journey, a service bottleneck or an idea that needs
            to be experienced.
          </p>
          <Link className="home-button" href="/contact">
            Talk about a journey sprint ↗
          </Link>
          <Link href="/lab" className="home-text-link">
            Keep exploring the Lab ↗
          </Link>
        </section>
      </main>
      <footer className="home-footer">
        <Link className="home-brand" href="/">
          assembl
        </Link>
        <p>Mahi that earns its proof.</p>
        <nav aria-label="Footer">
          <Link href="/contact">Contact</Link>
          <Link href="/legal/privacy">Privacy</Link>
          <Link href="/legal/terms">Terms</Link>
        </nav>
      </footer>
    </div>
  );
}
