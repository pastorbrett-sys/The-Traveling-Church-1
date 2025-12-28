export default function MissionSection() {
  return (
    <section id="mission" className="py-12 md:py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-card rounded-lg shadow-md p-6 md:p-8 border border-border">
          <h2 
            className="text-2xl md:text-3xl font-semibold text-primary mb-4"
            data-testid="text-mission-title"
          >
            Our Mission
          </h2>
          <p 
            className="text-base md:text-lg text-muted-foreground leading-relaxed"
            data-testid="text-mission-description"
          >
            The Traveling Church is redefining what it means to be a congregation. We're not bound by walls or traditions, we're a movement of faith that meets people exactly where they are. Through digital gatherings and real-world encounters across the globe, we're building a community united by love, acceptance, and the transformative power of the gospel.
          </p>
        </div>
      </div>
    </section>
  );
}
