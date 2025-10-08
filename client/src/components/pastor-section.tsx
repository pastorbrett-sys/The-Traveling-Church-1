export default function PastorSection() {
  return (
    <section id="pastor" className="py-12 md:py-16 px-4 bg-muted">
      <div className="max-w-4xl mx-auto">
        <h2 
          className="text-2xl md:text-3xl font-semibold text-primary mb-8 text-center"
          data-testid="text-pastor-title"
        >
          Meet Pastor Brett
        </h2>

        <div className="bg-card rounded-lg shadow-md overflow-hidden border border-border">
          <div className="md:flex">
            <div className="md:w-2/5">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800"
                alt="Pastor Brett"
                className="w-full h-64 md:h-full object-cover"
                data-testid="img-pastor"
              />
            </div>
            <div className="p-6 md:p-8 md:w-3/5">
              <h3 
                className="text-xl md:text-2xl font-semibold text-foreground mb-4"
                data-testid="text-pastor-subtitle"
              >
                A Journey of Faith and Service
              </h3>
              <div 
                className="space-y-4 text-muted-foreground leading-relaxed"
                data-testid="text-pastor-biography"
              >
                <p>
                  Pastor Brett didn't start his ministry in a seminary or traditional church. His calling came on the road, traveling through different communities and witnessing firsthand the hunger for authentic spiritual connection in our modern world.
                </p>
                <p>
                  Inspired by the early apostles who walked from town to town, Pastor Brett left behind the comforts of conventional ministry to become a traveling messenger of God's love. His mission is simple: meet people where they are, share the gospel without judgment, and build a global community united by faith and compassion.
                </p>
                <p>
                  With a background in theology, interfaith dialogue, and community building, Pastor Brett brings both knowledge and humility to his work. He believes that the church shouldn't be a building—it should be the people, gathering wherever they are, connected by love and purpose.
                </p>
                <p className="text-secondary font-medium">
                  "We don't need fancy robes or grand cathedrals. We need open hearts and willing hands. Come as you are, and let the Spirit do the rest."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
