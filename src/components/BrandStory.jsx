export default function BrandStory() {
  return (
    <section id="story" className="overflow-hidden bg-olive py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80&fm=webp"
                alt="Fabric detail"
                onError={(e) => { e.target.src = "https://via.placeholder.com/600x800?text=Fabric+Detail"; }}
                className="aspect-[3/4] rounded-2xl object-cover"
              />
              <img
                src="/brand-board.png"
                alt="herviva brand"
                onError={(e) => { e.target.src = "https://via.placeholder.com/600x800?text=Brand+Board"; }}
                className="mt-8 aspect-[3/4] rounded-2xl object-cover"
              />
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 rounded-2xl bg-terracotta px-8 py-5 text-center shadow-xl sm:left-auto sm:translate-x-0 lg:-right-8">
              <p className="font-serif text-3xl text-cream">8+</p>
              <p className="text-xs tracking-wide text-cream/80">Years of craft</p>
            </div>
          </div>

          <div>
            <span className="text-xs tracking-[0.3em] text-sage uppercase">Our Story</span>
            <h2 className="mt-3 font-serif text-3xl leading-tight font-medium text-cream sm:text-4xl lg:text-5xl">
              Woven with intention,<br />made for every her
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-cream/75 sm:text-base">
              herviva was born from a simple belief: every woman deserves a wardrobe that feels as beautiful
              as she is. We blend the richness of South Asian craftsmanship with clean, contemporary silhouettes
              — creating pieces that honour tradition while embracing the rhythm of modern life.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-cream/60 sm:text-base">
              From hand-selected linens to artisanal embroideries, each garment is designed to drape effortlessly,
              layer beautifully, and become a cherished part of your everyday story.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-cream/15 pt-10">
              {[
                { stat: "100%", label: "Natural fabrics" },
                { stat: "50+", label: "Unique designs" },
                { stat: "4.9", label: "Customer rating" },
              ].map((item) => (
                <div key={item.label}>
                  <p className="font-serif text-2xl text-terracotta sm:text-3xl">{item.stat}</p>
                  <p className="mt-1 text-xs text-cream/60">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
