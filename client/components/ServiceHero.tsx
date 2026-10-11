import { therapistDirectoryHref } from "../src/lib/concerns";

type ServiceHeroProps = {
  title: string;
  subtitle: string;
  img: string;
  imageAlt: string;
  specialtyAreas: string[];
};

export default function ServiceHero({
  title,
  subtitle,
  img,
  imageAlt,
  specialtyAreas,
}: ServiceHeroProps) {
  return (
    <section className="bg-[#F5F8F7] pb-20 pt-32 md:pt-40 lg:pt-48">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-12">
        <div className="max-w-3xl">
          <h1 className="mb-8 text-5xl font-heading font-extrabold leading-tight text-[#064F4B] lg:text-7xl">
            {title.split(' ').map((word, i) => (
              <span key={i} className={word === 'Strength' || word === 'Personal' || word === 'Re-build' ? 'text-[#0A7F7A]' : ''}>
                {word}{' '}
              </span>
            ))}
          </h1>
          <p className="mb-10 max-w-2xl text-lg leading-relaxed text-[#5F7F7A] md:text-xl">
            {subtitle}
          </p>
          <div>
            <a
              href={therapistDirectoryHref(specialtyAreas)}
              className="bg-[#0A7F7A] text-white px-12 py-5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-[#064F4B] transition-all shadow-2xl shadow-[#0A7F7A]/20 active:scale-95"
            >
              Begin Your Journey
            </a>
          </div>
        </div>
        <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2.5rem] border-[10px] border-white shadow-2xl shadow-[#064F4B]/15 lg:ml-auto">
          <img
            src={img}
            alt={imageAlt}
            loading="eager"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#064F4B]/25 via-transparent to-transparent" />
        </div>
      </div>
    </section>
  );
}
