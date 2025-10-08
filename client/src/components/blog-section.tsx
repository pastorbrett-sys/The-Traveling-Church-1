import { useQuery } from "@tanstack/react-query";
import type { BlogPost } from "@shared/schema";
import { Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";

export default function BlogSection() {
  const { data: posts, isLoading, error } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  if (isLoading) {
    return (
      <section id="blog" className="py-12 md:py-16 px-4 bg-muted">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-3 text-center">
            Pastor's Journal
          </h2>
          <p className="text-muted-foreground text-center mb-8">
            Updates and reflections from the road
          </p>
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card rounded-lg p-6 shadow-md animate-pulse border border-border">
                <div className="w-32 h-4 bg-muted rounded mb-3"></div>
                <div className="w-3/4 h-6 bg-muted rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="w-full h-3 bg-muted rounded"></div>
                  <div className="w-full h-3 bg-muted rounded"></div>
                  <div className="w-2/3 h-3 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="blog" className="py-12 md:py-16 px-4 bg-muted">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-3 text-center">
            Pastor's Journal
          </h2>
          <div className="text-center text-muted-foreground">
            Unable to load journal entries. Please try again later.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="blog" className="py-12 md:py-16 px-4 bg-muted">
      <div className="max-w-4xl mx-auto">
        <h2 
          className="text-2xl md:text-3xl font-semibold text-primary mb-3 text-center"
          data-testid="text-blog-title"
        >
          Pastor's Journal
        </h2>
        <p 
          className="text-muted-foreground text-center mb-8"
          data-testid="text-blog-subtitle"
        >
          Updates and reflections from the road
        </p>

        {posts && posts.length === 0 ? (
          <div className="text-center text-muted-foreground">
            No journal entries yet. Check back soon for updates from Pastor Brett's travels.
          </div>
        ) : (
          <div className="space-y-6">
            {posts?.map((post) => (
              <article
                key={post.id}
                className="bg-card rounded-lg overflow-hidden shadow-md border border-border"
                data-testid={`card-blog-${post.id}`}
              >
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-48 md:h-64 object-cover"
                    data-testid={`img-blog-${post.id}`}
                  />
                )}
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <time 
                        dateTime={typeof post.createdAt === 'string' ? post.createdAt : post.createdAt.toISOString()}
                        data-testid={`text-blog-date-${post.id}`}
                      >
                        {format(new Date(post.createdAt), "MMMM d, yyyy")}
                      </time>
                    </div>
                    {post.locationId && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span data-testid={`text-blog-location-${post.id}`}>
                          On the road
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 
                    className="text-xl md:text-2xl font-semibold text-foreground mb-3"
                    data-testid={`text-blog-title-${post.id}`}
                  >
                    {post.title}
                  </h3>
                  <div 
                    className="text-muted-foreground leading-relaxed whitespace-pre-wrap"
                    data-testid={`text-blog-content-${post.id}`}
                  >
                    {post.content}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
