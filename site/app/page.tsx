import ClientScripts from "./ClientScripts";
import BookingDialog from "./BookingDialog";
import HeroStage from "./HeroStage";
import type { CSSProperties } from "react";
import { client } from "../sanity/lib/client";
import { urlFor } from "../sanity/lib/image";
import { PROJECTS_QUERY, SITE_SETTINGS_QUERY, TESTIMONIALS_QUERY } from "../sanity/lib/queries";

export const revalidate = 60;

const BOOKING_URL = "https://cal.com/sagi-hatan-a4hnq6/30min";

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
  'Daphna Langer': '/assets/avatars/daphna.webp',
  'Sapir Aran': '/assets/avatars/sapir.webp',
  'Lior Avisar': '/assets/avatars/lior.webp',
  'Raz Ronen': '/assets/avatars/raz.webp',
  'Itay N.': '/assets/avatars/itay.webp',
  'Tal Gershenman': '/assets/avatars/tal.webp',
  'Omri Yeheskel': '/assets/avatars/omri_y.webp',
};

const localProjectIconMap: Record<string, string> = {
  bravos: '/assets/work/icons-big/bravos.png',
  draft: '/assets/work/icons-big/draft.png',
  newcore: '/assets/work/icons-big/newcore.png',
  voltify: '/assets/work/icons-big/voltify.png',
};

type SanityImage = {
  asset?: {
    _ref?: string;
  };
};

type SiteSettings = {
  showHeroStage?: boolean;
  trustedLogos?: TrustedLogo[];
};

type TrustedLogo = {
  _key?: string;
  name?: string;
  altText?: string;
  displayHeight?: number;
  maxWidth?: number;
  verticalOffset?: number;
  logoUrl?: string | null;
};

type Project = {
  _id: string;
  name: string;
  subtext: string;
  iconLabel: string;
  iconAsset?: SanityImage;
  accentColor: string;
  tags?: string[];
  tileSize: string;
  artVariant: string;
  imageFit?: 'cover' | 'contain';
  imagePosition?: string;
  imageBackgroundColor?: string;
  imagePadding?: number;
  image?: SanityImage;
};

const defaultTrustedLogos: TrustedLogo[] = [
  {
    _key: 'voltify',
    name: 'Voltify',
    altText: 'Voltify',
    displayHeight: 24,
    maxWidth: 138,
    verticalOffset: 0,
    logoUrl: '/assets/logos/voltify.svg',
  },
  {
    _key: 'mesh',
    name: 'MESH',
    altText: 'MESH',
    displayHeight: 24,
    maxWidth: 138,
    verticalOffset: 0,
    logoUrl: '/assets/logos/mesh.png',
  },
  {
    _key: 'wisor',
    name: 'Wisor.AI',
    altText: 'Wisor.AI',
    displayHeight: 31,
    maxWidth: 170,
    verticalOffset: -1,
    logoUrl: '/assets/logos/wisor.png',
  },
  {
    _key: 'quizell',
    name: 'Quizell',
    altText: 'Quizell',
    displayHeight: 24,
    maxWidth: 138,
    verticalOffset: 0,
    logoUrl: '/assets/logos/quizell.png',
  },
  {
    _key: 'nso',
    name: 'NSO Group',
    altText: 'NSO Group',
    displayHeight: 34,
    maxWidth: 98,
    verticalOffset: 1,
    logoUrl: '/assets/logos/nso.png',
  },
];

function getProjectImageUrl(image: SanityImage | undefined, width: number) {
  if (!image?.asset?._ref) return null;

  return urlFor(image)
    .width(width)
    .fit('max')
    .auto('format')
    .url();
}

function getProjectIconUrl(icon?: SanityImage) {
  if (!icon?.asset?._ref) return null;

  return urlFor(icon)
    .width(144)
    .height(144)
    .fit('crop')
    .quality(90)
    .auto('format')
    .url();
}

// Tiles are ~780px wide on desktop and full width on phones; the CSS picks one.
function getProjectImageStyle(project: Project): CSSProperties {
  return {
    '--project-image-lg': `url(${getProjectImageUrl(project.image, 1600)})`,
    '--project-image-sm': `url(${getProjectImageUrl(project.image, 1200)})`,
    '--project-image-fit': project.imageFit || 'cover',
    '--project-image-position': project.imagePosition || 'center',
    '--project-image-bg': project.imageBackgroundColor || 'transparent',
    '--project-image-padding': `${project.imagePadding || 0}px`,
  } as CSSProperties;
}

function getAvatarUrl(t: { name: string; avatar?: SanityImage }) {
  if (t.avatar?.asset?._ref) return urlFor(t.avatar).width(120).height(120).fit('crop').auto('format').url();
  return avatarMap[t.name] ?? null;
}

function getLocalProjectIconUrl(projectName: string) {
  const normalizedName = projectName.toLowerCase().replace(/\s+/g, '');

  for (const [name, iconUrl] of Object.entries(localProjectIconMap)) {
    if (normalizedName.includes(name)) return iconUrl;
  }

  return null;
}

function getTrustedLogoStyle(logo: TrustedLogo): CSSProperties {
  return {
    '--logo-height': `${logo.displayHeight || 30}px`,
    '--logo-max-width': `${logo.maxWidth || 170}px`,
    '--logo-y': `${logo.verticalOffset || 0}px`,
  } as CSSProperties;
}

function renderTrustedLogo(logo: TrustedLogo, index: number, isDuplicate = false) {
  if (!logo.logoUrl) return null;

  const name = logo.name || logo.altText || 'Trusted company logo';

  return (
    <span
      className={`proof-logo${isDuplicate ? ' dup' : ''}`}
      key={`${logo._key || logo.logoUrl || index}-${isDuplicate ? 'dup' : 'main'}`}
      style={getTrustedLogoStyle(logo)}
      aria-hidden={isDuplicate ? true : undefined}
    >
      <img src={logo.logoUrl} alt={isDuplicate ? '' : logo.altText || name} />
    </span>
  );
}

export default async function Home() {
  const fetchOptions = { next: { revalidate } };
  const [projects, testimonials, siteSettings] = await Promise.all([
    client.fetch(PROJECTS_QUERY, {}, fetchOptions),
    client.fetch(TESTIMONIALS_QUERY, {}, fetchOptions),
    client.fetch<SiteSettings | null>(SITE_SETTINGS_QUERY, {}, fetchOptions),
  ]);
  const cmsTrustedLogos = siteSettings?.trustedLogos?.filter((logo) => logo.logoUrl) || [];
  const trustedLogos = cmsTrustedLogos.length ? cmsTrustedLogos : defaultTrustedLogos;

  return (
    <>
  <div className="bg-waves"></div>

  {/* NAV */}
  <nav className="topnav" id="topnav">
    <div className="nav-inner">
      <a href="#" className="brand" aria-label="Sagi Hatan">
        <img src="/assets/logo.png" srcSet="/assets/logo@3x.webp 3x" alt="Sagi Hatan" width="49" height="56"
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
        <a href={BOOKING_URL} data-booking-trigger target="_blank" rel="noopener noreferrer" className="btn btn-primary"><span className="btn-ring"></span><span className="btn-shine"></span><span
            className="btn-label">Book a call</span></a>
      </div>
    </div>
  </nav>
  <div className="hero-bg" aria-hidden="true">
    <video className="depth-bg" autoPlay muted loop playsInline preload="auto" poster="/assets/hero_bg_poster.webp">
      <source src="/assets/hero_bg_v3.webm" type="video/webm" />
      <source src="/assets/hero_bg_v3.mp4" type="video/mp4" />
    </video>
  </div>
  <div className="nav-spacer"></div>

  {/* HERO */}
  <header className="hero wrap">
    <h1 className="hero-title">
      <span className="mask-wrap"><span className="mask-text">One designer.</span></span><br />
      <span className="mask-wrap" style={{paddingTop: "4px"}}><span className="mask-text"><em>Full coverage.</em></span></span>
    </h1>
    <p className="hero-sub" style={{width: "520px"}}>From early ideas and UX to polished<br />digital products and websites.
    </p>
    <div className="hero-cta">
      <a className="btn btn-lg btn-ghost" href="#work">See my work</a>
      <a className="btn btn-lg btn-primary" href={BOOKING_URL} data-booking-trigger target="_blank" rel="noopener noreferrer"><span className="btn-ring"></span><span className="btn-shine"></span><span
          className="btn-label">Book a call</span></a>
    </div>

    {trustedLogos.length ? (
    <div className="proof">
      <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "18px", width: "100%"}}>
        <span className="label">Trusted by teams at</span>
        <div className="logos">
          <div className="logos-track">
            {trustedLogos.map((logo, index) => renderTrustedLogo(logo, index))}
            {trustedLogos.map((logo, index) => renderTrustedLogo(logo, index, true))}
          </div>
        </div>
      </div>
    </div>
    ) : null}

    {siteSettings?.showHeroStage !== false ? <HeroStage /> : null}
  </header>

  {/* VALUE */}
  <section id="services" className="wrap sys-reveal-trigger">
    <div className="section-head">
      <h2 className="section-title" style={{color: "rgb(0,0,0)"}}>
        <span className="mask-wrap"><span className="mask-text">From start to scale.</span></span><br />
        <span className="mask-wrap" style={{paddingTop: "4px"}}><span className="mask-text"><em
              style={{fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: "400", letterSpacing: "-0.01em", color: "var(--ink)"}}>End-to-end.</em></span></span>
      </h2>
    </div>
    <div className="value-grid">
      <article className="v-card fade-el" style={{"--stg": "2"} as React.CSSProperties}>
        <div className="v-video"><video src="/assets/card1_v3.mp4" muted playsInline loop preload="none"
            poster="/assets/card1_poster.webp"></video></div>
        <div className="v-body">
          <div className="v-tag">For founders</div>
          <h3 className="v-title">Build from scratch</h3>
          <p className="v-desc">Turn ideas into real products, with clear flows and design ready to ship.</p>
        </div>
        <span className="corner-glow"></span>
      </article>
      <article className="v-card fade-el" style={{"--stg": "3"} as React.CSSProperties}>
        <div className="v-video"><video src="/assets/card2_v3.mp4" muted playsInline loop preload="none"
            poster="/assets/card2_poster.webp"></video></div>
        <div className="v-body">
          <div className="v-tag">For existing products</div>
          <h3 className="v-title">Make it better</h3>
          <p className="v-desc">Improve UX, fix flows, and make the product cleaner and easier to use.</p>
        </div>
        <span className="corner-glow"></span>
      </article>
      <article className="v-card fade-el" style={{"--stg": "4"} as React.CSSProperties}>
        <div className="v-video"><video src="/assets/card3_v3.mp4" muted playsInline loop preload="none"
            poster="/assets/card3_poster.webp"></video></div>
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
        <picture>
          <source srcSet="/assets/profile.webp" type="image/webp" />
          <img src="/assets/profile.png" alt="Sagi Hatan" width="976" height="565" loading="lazy" decoding="async" />
        </picture>
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
        const projectImageUrl = getProjectImageUrl(project.image, 1600);
        const projectIconUrl = getLocalProjectIconUrl(project.name) ?? getProjectIconUrl(project.iconAsset);

        return (
          <div
            key={project._id}
            className={`tile ${project.tileSize} ${project.artVariant} fade-el`}
            data-project-number={String(i + 1).padStart(2, '0')}
          >
            <div
              className={projectImageUrl ? 'art cms-art' : (artClassMap[project.artVariant] ?? 'art')}
              style={projectImageUrl ? getProjectImageStyle(project) : undefined}
            >
              {!projectImageUrl && renderProjectArt(project.artVariant)}
            </div>
            <div className="overlay">
              <div className="project-content">
                <div className="project-brand">
                  <div className={`project-icon accent-${project.accentColor}`}>
                    {projectIconUrl ? (
                      <img
                        className="project-icon-img"
                        src={projectIconUrl}
                        alt=""
                        width="48"
                        height="48"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : project.iconLabel}
                  </div>
                  <div className="project-copy">
                    <h4 className="project-name">{project.name}</h4>
                    <p className="project-subtext">{project.subtext}</p>
                  </div>
                </div>
                <div className="project-tags" aria-label="Project tags">
                  {project.tags?.map((tag: string, i: number) => (
                    <span key={`${tag}-${i}`} className="project-tag">{tag}</span>
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
              <div className="av">{getAvatarUrl(t) && <img src={getAvatarUrl(t)!} alt={t.name} width="40" height="40" loading="lazy" decoding="async" />}</div>
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
        <video muted playsInline loop preload="none" poster="/assets/cta_poster.webp"
          style={{width: "100%", height: "100%", objectFit: "contain", borderRadius: "16px"}}>
          <source src="/assets/cta_v3.webm" type="video/webm" />
          <source src="/assets/cta_v3.mp4" type="video/mp4" />
        </video>
      </div>
      <h2 className="cta-title"><span className="mask-wrap"><span className="mask-text">Ready <em>when</em></span></span><span
          className="cta-brk"></span> <span className="mask-wrap"><span className="mask-text">you are</span></span></h2>
      <p className="cta-sub">No long onboarding. Let&rsquo;s get started.</p>
      <a href={BOOKING_URL} data-booking-trigger target="_blank" rel="noopener noreferrer" className="btn btn-lg btn-primary"><span className="btn-ring"></span><span className="btn-shine"></span><span
          className="btn-label">Book a call</span></a>
    </div>
  </section>

      <BookingDialog bookingUrl={BOOKING_URL} />
      <ClientScripts />
    </>
  );
}
