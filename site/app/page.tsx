import ClientScripts from "./ClientScripts";
import { client } from "../sanity/lib/client";
import { urlFor } from "../sanity/lib/image";
import { PROJECTS_QUERY, TESTIMONIALS_QUERY } from "../sanity/lib/queries";

export const revalidate = 60;

const artClassMap: Record<string, string> = {
  'art-1': 'art mock',
  'art-2': 'art mock',
  'art-3': 'art',
  'art-4': 'art',
  'art-5': 'art mock-orb',
  'art-6': 'art',
};

function renderProjectArt(artVariant: string) {
  switch (artVariant) {
    case 'art-1': return <>
      <div className="mock-player">
        <div className="sub">Now playing · 02:14</div>
        <div className="title">Slow horizon — Midori</div>
        <div className="waveform">
          <span style={{height:"30%"}}></span><span style={{height:"55%"}}></span><span style={{height:"70%"}}></span><span style={{height:"40%"}}></span>
          <span style={{height:"85%"}}></span><span style={{height:"60%"}}></span><span style={{height:"30%"}}></span><span style={{height:"70%"}}></span>
          <span style={{height:"45%"}}></span><span style={{height:"90%"}}></span><span style={{height:"50%"}}></span><span style={{height:"35%"}}></span>
          <span style={{height:"75%"}}></span><span style={{height:"60%"}}></span><span style={{height:"28%"}}></span><span style={{height:"55%"}}></span>
          <span style={{height:"80%"}}></span><span style={{height:"35%"}}></span><span style={{height:"60%"}}></span><span style={{height:"45%"}}></span>
          <span style={{height:"70%"}}></span><span style={{height:"25%"}}></span><span style={{height:"55%"}}></span><span style={{height:"40%"}}></span>
          <span style={{height:"80%"}}></span><span style={{height:"60%"}}></span><span style={{height:"35%"}}></span><span style={{height:"70%"}}></span>
          <span style={{height:"45%"}}></span><span style={{height:"60%"}}></span>
        </div>
        <div className="controls">
          <div className="play"></div>
          <div className="bar"></div>
        </div>
      </div>
      <div className="mock-card" style={{right:"8%",top:"16%"}}>
        <div style={{fontFamily:"var(--font-sans)",fontWeight:"700",fontSize:"14px",letterSpacing:"-0.01em",marginBottom:"8px"}}>Queue</div>
        <div className="mock-row" style={{marginBottom:"6px"}}><div className="mock-dot" style={{width:"14px",height:"14px"}}></div><div className="mock-chip" style={{width:"70px"}}></div></div>
        <div className="mock-row" style={{marginBottom:"6px"}}><div className="mock-dot" style={{width:"14px",height:"14px",background:"rgba(11,11,15,0.18)"}}></div><div className="mock-chip" style={{width:"50px"}}></div></div>
        <div className="mock-row"><div className="mock-dot" style={{width:"14px",height:"14px",background:"rgba(11,11,15,0.18)"}}></div><div className="mock-chip" style={{width:"60px"}}></div></div>
      </div>
    </>;
    case 'art-2': return <div className="mock-logo">F<span style={{fontFamily:"var(--font-serif)",fontWeight:400,fontStyle:"italic"}}>ast</span><small>Brand · identity</small></div>;
    case 'art-3': return <div className="mock-dash">
      <div className="h"><div className="tag">Balance · USD</div><div className="tag">Today</div></div>
      <div className="num"><span>$48,210</span>.24</div>
      <div className="spark">
        <i style={{height:"30%"}}></i><i style={{height:"55%"}}></i><i style={{height:"40%"}}></i><i style={{height:"70%"}}></i>
        <i style={{height:"50%"}}></i><i style={{height:"85%"}}></i><i style={{height:"65%"}}></i><i style={{height:"92%"}}></i>
        <i style={{height:"60%"}}></i><i style={{height:"78%"}}></i><i style={{height:"40%"}}></i><i style={{height:"95%"}}></i>
      </div>
      <div style={{display:"flex",gap:"8px"}}>
        <div style={{flex:"1",background:"#f7f3f4",borderRadius:"8px",padding:"8px 10px"}}><div className="tag">Inflow</div><div style={{fontFamily:"var(--font-sans)",fontWeight:"700",fontSize:"14px",marginTop:"2px"}}>+$6.2k</div></div>
        <div style={{flex:"1",background:"#f7f3f4",borderRadius:"8px",padding:"8px 10px"}}><div className="tag">Outflow</div><div style={{fontFamily:"var(--font-sans)",fontWeight:"700",fontSize:"14px",marginTop:"2px"}}>−$2.1k</div></div>
      </div>
    </div>;
    case 'art-4': return <div className="mock-flow">
      <div className="side"><i className="a"></i><i></i><i></i><i></i><i></i></div>
      <div className="main"><i className="mid"></i><i className="wide"></i><i className="wide"></i><i className="sm"></i><i className="mid"></i></div>
    </div>;
    case 'art-5': return <div className="o"></div>;
    case 'art-6': return <div className="mock-wallet">
      <div className="label">Ledger · Savings</div>
      <div className="amt"><span>$12,480</span></div>
      <div className="row"><div className="label">+3.4% MoM</div><div className="pill">Active</div></div>
    </div>;
    default: return null;
  }
}

const avatarMap: Record<string, string> = {
  'Daphna Langer': '/assets/daphna.webp',
  'Sapir Aran': '/assets/sapir.jpeg',
  'Lior Avisar': '/assets/lior.jpeg',
  'Raz Ronen': '/assets/raz.jpeg',
  'Itay N.': '/assets/itay.jpeg',
  'Tal Gershenman': '/assets/tal.jpeg',
  'Omri Yeheskel': '/assets/omri_y.jpeg',
};

type SanityImage = {
  asset?: {
    _ref?: string;
  };
};

type Project = {
  _id: string;
  name: string;
  subtext: string;
  iconLabel: string;
  accentColor: string;
  tags?: string[];
  tileSize: string;
  artVariant: string;
  image?: SanityImage;
};

function getProjectImageUrl(image?: SanityImage) {
  if (!image?.asset?._ref) return null;

  return urlFor(image)
    .width(2400)
    .fit('max')
    .auto('format')
    .url();
}

export default async function Home() {
  const fetchOptions = { next: { revalidate } };
  const [projects, testimonials] = await Promise.all([
    client.fetch(PROJECTS_QUERY, {}, fetchOptions),
    client.fetch(TESTIMONIALS_QUERY, {}, fetchOptions),
  ]);

  return (
    <>
  <div className="bg-waves"></div>

  {/* NAV */}
  <nav className="topnav" id="topnav">
    <div className="nav-inner">
      <a href="#" className="brand" aria-label="Sagi Hatan">
        <img src="/assets/logo.png" alt="Sagi Hatan" width="49" height="56"
          style={{display: "block", width: "auto", height: "40px"}} />
      </a>
      <div className="nav-grow"></div>
      <ul className="links">
        <li><a href="#services">Why me</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#work">Work</a></li>
        <li><a href="#love">Love letters</a></li>
        <li><a href="#cta">Get Started</a></li>
      </ul>
      <div className="nav-right">
        <a href="#cta" className="btn btn-primary"><span className="btn-ring"></span><span className="btn-shine"></span><span
            className="btn-label">Book a call</span></a>
      </div>
    </div>
  </nav>
  <div className="hero-bg" aria-hidden="true">
    <video className="depth-bg" src="/assets/hero_bg.mp4" autoPlay muted loop playsInline></video>
  </div>
  <div className="nav-spacer"></div>

  {/* HERO */}
  <header className="hero wrap">
    <h1 className="hero-title">
      <span className="mask-wrap"><span className="mask-text">The senior designer</span></span><br />
      <span className="mask-wrap" style={{paddingTop: "4px"}}><span className="mask-text"><em>your</em> product
          needs</span></span>
    </h1>
    <p className="hero-sub" style={{width: "520px"}}>From idea to product, or as part of your team.<br />I step in where needed.
    </p>
    <div className="hero-cta">
      <a className="btn btn-lg btn-ghost" href="#work">See my work</a>
      <a className="btn btn-lg btn-primary" href="#cta"><span className="btn-ring"></span><span className="btn-shine"></span><span
          className="btn-label">Book a call</span></a>
    </div>

    <div className="proof">
      <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "18px", width: "100%"}}>
        <span className="label">Trusted by teams at</span>
        <div className="logos">
          <div className="logos-track">
            <span className="proof-logo"><span className="g"></span>Northwind</span>
            <span className="proof-logo alt"><span className="g"></span>Lumen</span>
            <span className="proof-logo alt2"><span className="g"></span>Fieldpoint</span>
            <span className="proof-logo"><span className="g"></span>Halcyon</span>
            <span className="proof-logo alt"><span className="g"></span>Orchard</span>
            {/* duplicated set for seamless loop (shown only on mobile) */}
            <span className="proof-logo dup" aria-hidden="true"><span className="g"></span>Northwind</span>
            <span className="proof-logo alt dup" aria-hidden="true"><span className="g"></span>Lumen</span>
            <span className="proof-logo alt2 dup" aria-hidden="true"><span className="g"></span>Fieldpoint</span>
            <span className="proof-logo dup" aria-hidden="true"><span className="g"></span>Halcyon</span>
            <span className="proof-logo alt dup" aria-hidden="true"><span className="g"></span>Orchard</span>
          </div>
        </div>
      </div>
    </div>

    <div className="hero-stage" aria-hidden="true">
      <div className="hero-stage-chrome"><span className="d"></span><span className="d"></span><span className="d"></span></div>
      <div className="hero-stage-inner">
        <span className="placeholder-label">recent-case-study.mp4 · drop in</span>
      </div>
    </div>
  </header>

  {/* VALUE */}
  <section id="services" className="wrap sys-reveal-trigger">
    <div className="section-head">
      <h2 className="section-title" style={{color: "rgb(0,0,0)"}}>
        <span className="mask-wrap"><span className="mask-text">One designer.</span></span><br />
        <span className="mask-wrap" style={{paddingTop: "4px"}}><span className="mask-text"><em
              style={{fontFamily: "'Instrument Serif'", fontStyle: "italic", fontWeight: "400", letterSpacing: "-0.01em", color: "var(--ink)"}}>Full
              coverage.</em></span></span>
      </h2>
    </div>
    <div className="value-grid">
      <article className="v-card fade-el" style={{"--stg": "2"} as React.CSSProperties}>
        <div className="v-video"><video src="/assets/card1.mp4?v=2" muted playsInline loop preload="metadata"
            data-card-video></video></div>
        <div className="v-body">
          <div className="v-tag">For founders</div>
          <h3 className="v-title">Build from scratch</h3>
          <p className="v-desc">Turn ideas into real products, with clear flows and design ready to ship.</p>
        </div>
        <span className="corner-glow"></span>
      </article>
      <article className="v-card fade-el" style={{"--stg": "3"} as React.CSSProperties}>
        <div className="v-video"><video src="/assets/card2.mp4?v=2" muted playsInline loop preload="metadata"
            data-card-video></video></div>
        <div className="v-body">
          <div className="v-tag">For existing products</div>
          <h3 className="v-title">Make it better</h3>
          <p className="v-desc">Improve UX, fix flows, and make the product cleaner and easier to use.</p>
        </div>
        <span className="corner-glow"></span>
      </article>
      <article className="v-card fade-el" style={{"--stg": "4"} as React.CSSProperties}>
        <div className="v-video"><video src="/assets/card3.mp4?v=2" muted playsInline loop preload="metadata"
            data-card-video></video></div>
        <div className="v-body">
          <div className="v-tag">For a boost</div>
          <h3 className="v-title">Join your team</h3>
          <p className="v-desc">Step in fast, adapt quickly, and help your team move things forward.</p>
        </div>
        <span className="corner-glow"></span>
      </article>
    </div>
  </section>

  {/* ABOUT */}
  <section id="about" className="wrap sys-reveal-trigger">
    <div className="about-grid">
      <div>
        <div className="about-hey">Hey</div>
        <h2 className="about-title"><span className="mask-wrap"><span className="mask-text">I&rsquo;m Sagi</span></span></h2>
        <div className="about-body">
          <p>I have 8+ years in product design, working with startups from early ideas to shipped products and ongoing
            improvements.</p>
          <p>I focus on turning complexity into simple, clear, and beautiful products — quick to adapt, and focused on
            what actually moves things forward.</p>
        </div>
        <div className="about-sig" style={{letterSpacing: "-3.2px"}}><span className="mask-wrap"><span className="mask-text">Sagi
              Hatan</span></span><img className="about-sig-img" src="/assets/signature_mobile.svg" alt="Sagi Hatan" /></div>
      </div>
      <div className="about-portrait">
        <img src="/assets/profile.png" alt="Sagi Hatan" width="976" height="565" loading="lazy" decoding="async" />
      </div>
    </div>
  </section>

  {/* WORK */}
  <section id="work" className="wrap sys-reveal-trigger">
    <div className="section-head">
      <h2 className="section-title"><span className="mask-wrap" style={{marginRight: "0.3em"}}><span
            className="mask-text">Recent</span></span><span className="mask-wrap"><span
            className="mask-text"><em>works</em></span></span></h2>
    </div>
    <div className="bento">
      {(projects as Project[]).map((project, i) => {
        const projectImageUrl = getProjectImageUrl(project.image);

        return (
          <div
            key={project._id}
            className={`tile ${project.tileSize} ${project.artVariant} fade-el`}
            data-project-number={String(i + 1).padStart(2, '0')}
          >
            <div
              className={projectImageUrl ? 'art cms-art' : (artClassMap[project.artVariant] ?? 'art')}
              style={projectImageUrl ? { backgroundImage: `url(${projectImageUrl})` } : undefined}
            >
              {!projectImageUrl && renderProjectArt(project.artVariant)}
            </div>
            <div className="overlay">
              <div className="project-content">
                <div className="project-brand">
                  <div className={`project-icon accent-${project.accentColor}`}>{project.iconLabel}</div>
                  <div className="project-copy">
                    <h4 className="project-name">{project.name}</h4>
                    <p className="project-subtext">{project.subtext}</p>
                  </div>
                </div>
                <div className="project-tags" aria-label="Project tags">
                  {project.tags?.map((tag: string) => (
                    <span key={tag} className="project-tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
            <span className="glow"></span>
          </div>
        );
      })}
    </div>
  </section>

  {/* TESTIMONIALS */}
  <section id="love" className="wrap sys-reveal-trigger">
    <div className="love-title-row">
      <h2 className="love-title"><span className="mask-wrap" style={{marginRight: "0.3em"}}><span
            className="mask-text">Love</span></span><span className="mask-wrap"><span
            className="mask-text"><em>letters</em></span></span></h2>
    </div>
    <div className="love-track-wrap">
      <div className="love-track" id="love-track">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {testimonials.map((t: any) => (
          <article key={t._id} className="love-card">
            <img className="love-star" src="/assets/star.svg" alt="" aria-hidden="true" />
            <div className="love-who">
              <div className="av"><img src={avatarMap[t.name] ?? '/assets/daphna.webp'} alt={t.name} width="40" height="40" loading="lazy" decoding="async" /></div>
              <div>
                <div className="name">{t.name}</div>
                <div className="role">{t.role}</div>
              </div>
            </div>
            <h4 className="love-headline">{t.headline}</h4>
            <p className="love-body">{t.body}</p>
          </article>
        ))}
      </div>
    </div>
    <div className="love-nav">
      <button id="love-prev" aria-label="Previous"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg></button>
      <button id="love-next" aria-label="Next"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 6l6 6-6 6" />
        </svg></button>
    </div>
  </section>

  {/* CTA */}
  <section id="cta" className="wrap sys-reveal-trigger">
    <div className="cta-box">
      <div className="cta-visual">
        <video src="/assets/cta.mp4" muted playsInline loop preload="metadata" data-card-video
          style={{width: "100%", height: "100%", objectFit: "contain", borderRadius: "16px"}}></video>
      </div>
      <h2 className="cta-title"><span className="mask-wrap"><span className="mask-text">Ready <em>when</em></span></span><span
          className="cta-brk"></span> <span className="mask-wrap"><span className="mask-text">you are</span></span></h2>
      <p className="cta-sub">No long onboarding. Let&rsquo;s get started.</p>
      <a href="#" className="btn btn-lg btn-primary"><span className="btn-ring"></span><span className="btn-shine"></span><span
          className="btn-label">Book a call</span></a>
    </div>
  </section>


  {/* TWEAKS */}
  <button className="tw-fab" id="twFab">⚙ Tweaks</button>
  <div className="tw-panel" id="twPanel">
    <h6>Tweaks</h6>
    <div className="tw-row">
      <span>Accent hue</span>
      <div className="tw-swatches" id="hueSwatches">
        <div className="tw-swatch sel" data-hue="warm" style={{background: "linear-gradient(140deg,#DC6034,#671186)"}}></div>
        <div className="tw-swatch" data-hue="cool" style={{background: "linear-gradient(140deg,#1ebfa0,#2c6edb)"}}></div>
        <div className="tw-swatch" data-hue="mono" style={{background: "linear-gradient(140deg,#444,#111)"}}></div>
        <div className="tw-swatch" data-hue="sun" style={{background: "linear-gradient(140deg,#f5a524,#e0467e)"}}></div>
      </div>
    </div>
    <div className="tw-row">
      <span>Background</span>
      <div className="tw-swatches" id="bgSwatches">
        <div className="tw-swatch sel" data-bg="#FAF8F8" style={{background: "#FAF8F8", boxShadow: "0 0 0 1px #ddd"}}></div>
        <div className="tw-swatch" data-bg="#F5F1EE" style={{background: "#F5F1EE", boxShadow: "0 0 0 1px #ddd"}}></div>
        <div className="tw-swatch" data-bg="#0F0D14" style={{background: "#0F0D14"}}></div>
      </div>
    </div>
  </div>


      <ClientScripts />
    </>
  );
}
