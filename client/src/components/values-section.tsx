import { Users, Heart, Home } from "lucide-react";

export default function ValuesSection() {
  const values = [
    {
      id: "grassroots",
      icon: Users,
      title: "Grassroots Apostolic Approach",
      description: "A return to the grassroots apostolic approach to the church. Go out in small groups or alone and spread the word of Christ and God's love wherever we go. Like the early disciples, we take the message to the streets, to the people, meeting them in their daily lives."
    },
    {
      id: "come-as-you-are",
      icon: Heart,
      title: "Come As You Are",
      description: "Removal of \"Things\" from the church. Fancy outfits, dressing up, and traditions have no place here. The days of being kept from holy sites for sandals, shorts and showing skin are over. We come as we are and leave changed by the spirit. Respect for God comes from inward faith and not outward appearance."
    },
    {
      id: "all-welcome",
      icon: Home,
      title: "All Are Welcome",
      description: "Our congregation does not cast judgement or look down on anyone, regardless of race, gender, sexual orientation, medical condition or addiction. All are welcome. Our job is to welcome not repel. We acknowledge sins are not the sinner—every person is loved unconditionally by God."
    }
  ];

  return (
    <section id="values" className="py-12 md:py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 
          className="text-2xl md:text-3xl font-semibold text-primary mb-3 text-center"
          data-testid="text-values-title"
        >
          Our Values
        </h2>
        <p 
          className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto"
          data-testid="text-values-subtitle"
        >
          The core principles that guide our ministry and define who we are
        </p>

        <div className="space-y-6">
          {values.map((value, index) => {
            const IconComponent = value.icon;
            const colorClass = index === 0 ? "text-secondary" : index === 1 ? "text-accent" : "text-primary";
            const bgColorClass = index === 0 ? "bg-secondary/10" : index === 1 ? "bg-accent/10" : "bg-primary/10";

            return (
              <div
                key={value.id}
                className="bg-card rounded-lg shadow-md p-6 md:p-8 border border-border"
                data-testid={`card-value-${value.id}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full ${bgColorClass} flex items-center justify-center`}>
                    <IconComponent className={`w-6 h-6 ${colorClass}`} />
                  </div>
                  <div className="flex-1">
                    <h3 
                      className="text-lg md:text-xl font-semibold text-foreground mb-2"
                      data-testid={`text-value-title-${value.id}`}
                    >
                      {value.title}
                    </h3>
                    <p 
                      className="text-muted-foreground leading-relaxed"
                      data-testid={`text-value-description-${value.id}`}
                    >
                      {value.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
