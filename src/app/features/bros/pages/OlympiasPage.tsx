interface Olympian {
  name: string;
  years: string;
  era: string;
  image: string;
}

const OLYMPIANS: Olympian[] = [
  { name: "Arnold Schwarzenegger", years: "1970–1975, 1980", era: "Golden Era", image: "https://images.unsplash.com/photo-1583500178690-f7fd39bdcd17?w=600" },
  { name: "Lee Haney", years: "1984–1991", era: "8x champion", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600" },
  { name: "Dorian Yates", years: "1992–1997", era: "Mass monster", image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600" },
  { name: "Ronnie Coleman", years: "1998–2005", era: "8x legend", image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600" },
  { name: "Jay Cutler", years: "2006–2007, 2009–2010", era: "Modern era", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600" },
  { name: "Phil Heath", years: "2011–2017", era: "The Gift", image: "https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=600" },
];

export function OlympiasPage() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {OLYMPIANS.map((o) => (
        <article key={o.name} className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="aspect-[4/3] bg-muted overflow-hidden">
            <img src={o.image} alt={o.name} className="w-full h-full object-cover" />
          </div>
          <div className="p-4">
            <h3>{o.name}</h3>
            <p className="text-muted-foreground">{o.years}</p>
            <p className="text-muted-foreground">{o.era}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
