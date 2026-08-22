const PHOTOS: Record<string, string> = {
  tokyo: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=70&auto=format&fit=crop",
  japan: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=70&auto=format&fit=crop",
  paris: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=70&auto=format&fit=crop",
  france: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=70&auto=format&fit=crop",
  iceland: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&q=70&auto=format&fit=crop",
  bali: "https://images.unsplash.com/photo-1518509562904-e7ef99cddc85?w=800&q=70&auto=format&fit=crop",
  barcelona: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=70&auto=format&fit=crop",
  singapore: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=70&auto=format&fit=crop",
  london: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=70&auto=format&fit=crop",
  "new york": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=70&auto=format&fit=crop",
  nyc: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=70&auto=format&fit=crop",
  rome: "https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=800&q=70&auto=format&fit=crop",
  greece: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=70&auto=format&fit=crop",
  athens: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=70&auto=format&fit=crop",
  lisbon: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800&q=70&auto=format&fit=crop",
  dubai: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=70&auto=format&fit=crop",
  bangkok: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=70&auto=format&fit=crop",
  seoul: "https://images.unsplash.com/photo-1538485399081-7c8ce013b933?w=800&q=70&auto=format&fit=crop",
  amsterdam: "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=800&q=70&auto=format&fit=crop",
  norway: "https://images.unsplash.com/photo-1520769945061-0a448c463865?w=800&q=70&auto=format&fit=crop",
  switzerland: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&q=70&auto=format&fit=crop",
  india: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=70&auto=format&fit=crop",
};

const DEFAULT_PHOTO =
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=70&auto=format&fit=crop";

export function photoForDestination(destination: string): string {
  const lower = destination.toLowerCase();
  for (const [key, url] of Object.entries(PHOTOS)) {
    if (lower.includes(key)) return url;
  }
  return DEFAULT_PHOTO;
}
