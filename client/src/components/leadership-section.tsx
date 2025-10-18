export default function LeadershipSection() {
  const danielImage = "/public-objects/Daniel_1760680915194.jpg";
  const joshImage = "/public-objects/Josh_1760681040173.jpg";
  
  const leaders = [
    {
      name: "Daniel Stockdale",
      title: "Treasurer",
      image: danielImage,
      description: "Dedicated to spreading faith and building community through servant leadership and compassion.",
    },
    {
      name: "Joshua Castillo",
      title: "Community Growth",
      image: joshImage,
      description: "Passionate about connecting cultures and bringing people together in faith and fellowship.",
    },
  ];

  const createSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  };

  return (
    <section id="leadership" className="py-16 md:py-24 bg-background">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-12" data-testid="heading-leadership">
          Church Leadership
        </h2>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {leaders.map((leader) => {
            const slug = createSlug(leader.name);
            return (
              <div
                key={leader.name}
                className="flex flex-col items-center text-center"
                data-testid={`card-leader-${slug}`}
              >
                <div className="w-48 h-48 md:w-56 md:h-56 mb-6 rounded-full overflow-hidden">
                  <img
                    src={leader.image}
                    alt={leader.name}
                    className="w-full h-full object-cover"
                    data-testid={`img-leader-${slug}`}
                    loading="lazy"
                  />
                </div>
                <h3
                  className="text-2xl md:text-3xl font-semibold mb-2"
                  data-testid={`text-leader-name-${slug}`}
                >
                  {leader.name}
                </h3>
                <p
                  className="text-sm md:text-base text-primary font-medium mb-3"
                  data-testid={`text-leader-title-${slug}`}
                >
                  {leader.title}
                </p>
                <p
                  className="text-muted-foreground max-w-md"
                  data-testid={`text-leader-description-${slug}`}
                >
                  {leader.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
