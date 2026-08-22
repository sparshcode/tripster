const PHOTOS: Record<string, string> = {
  tokyo: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=70&auto=format&fit=crop",
  paris: "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&q=70&auto=format&fit=crop",
  france: "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&q=70&auto=format&fit=crop",
  iceland: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&q=70&auto=format&fit=crop",
  bali: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=70&auto=format&fit=crop",
  barcelona: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=70&auto=format&fit=crop",
  singapore: "https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800&q=70&auto=format&fit=crop",
  london: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=70&auto=format&fit=crop",
  "new york": "https://images.unsplash.com/photo-1522083165195-3424ed129620?w=800&q=70&auto=format&fit=crop",
  rome: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=70&auto=format&fit=crop",
  greece: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=70&auto=format&fit=crop",
  athens: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=70&auto=format&fit=crop",
  lisbon: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800&q=70&auto=format&fit=crop",
  dubai: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=70&auto=format&fit=crop",
  bangkok: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=70&auto=format&fit=crop",
  seoul: "https://images.unsplash.com/photo-1538485399081-7c8ce013b933?w=800&q=70&auto=format&fit=crop",
  amsterdam: "https://images.unsplash.com/photo-1534351590666-13e3e96c5017?w=800&q=70&auto=format&fit=crop",
  barcelonaes: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=70&auto=format&fit=crop",
  norway: "https://images.unsplash.com/photo-1520769945061-0a448c463865?w=800&q=70&auto=format&fit=crop",
  switzerland: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&q=70&auto=format&fit=crop",
  japan: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=70&auto=format&fit=crop",
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
