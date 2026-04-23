import Link from "next/link";

export function CategoriesBar() {
  const tags = ['Next.js', 'React', 'Vue', 'Node.js', '.NET Core', 'PostgreSQL', 'Supabase', 'Tailwind CSS'];
  
  return (
    <section className="border-y border-slate-100 bg-slate-50 py-4">
      <div className="container mx-auto px-4 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-4 min-w-max text-sm font-medium text-slate-600">
          <span className="text-slate-400 uppercase tracking-wider text-xs mr-2">Popular Stacks:</span>
          {tags.map((tag) => (
            <Link key={tag} href={`/products?tag=${tag.toLowerCase()}`} className="px-4 py-2 rounded-full bg-white border border-slate-200 hover:border-primary hover:text-primary transition-colors">
              {tag}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
