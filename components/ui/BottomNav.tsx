"use client";

interface BottomNavProps {
  onSearchFocus: () => void;
  onFavoritesClick: () => void;
  favoritesCount: number;
}

export default function BottomNav({
  onSearchFocus,
  onFavoritesClick,
  favoritesCount,
}: BottomNavProps) {
  const tabs = [
    { id: "map", label: "Carte", icon: "map" },
    { id: "search", label: "Recherche", icon: "search", onClick: onSearchFocus },
    { id: "itinerary", label: "Itinéraire", icon: "route" },
    { id: "favorites", label: "Favoris", icon: "star", onClick: onFavoritesClick, badge: favoritesCount },
    { id: "menu", label: "Menu", icon: "menu" },
  ];

  const renderIcon = (icon: string) => {
    const cls = "w-5 h-5";
    switch (icon) {
      case "map":
        return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls}><path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4zM8 2v16M16 6v16" /></svg>;
      case "search":
        return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls}><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>;
      case "route":
        return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls}><path d="M3 17l3-5 3 5M9 7h6M9 11h6M9 15h3" /><circle cx="18" cy="17" r="3" /></svg>;
      case "star":
        return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>;
      case "menu":
        return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls}><path d="M4 6h16M4 12h16M4 18h16" /></svg>;
      default:
        return null;
    }
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-100 z-30 flex justify-around items-center px-2"
      style={{ paddingBottom: "var(--safe-bottom, 12px)" }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={tab.onClick}
          className="flex flex-col items-center py-2 px-3 min-w-[60px] text-gray-400 hover:text-accent transition-colors relative"
        >
          {renderIcon(tab.icon)}
          <span className="text-[10px] font-medium mt-0.5">{tab.label}</span>
          {tab.badge ? (
            <span className="absolute top-1 right-1 bg-accent text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
              {tab.badge}
            </span>
          ) : null}
        </button>
      ))}
    </nav>
  );
}
