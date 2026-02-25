import Link from 'next/link';

const themes = [
    { name: "Ramadan Kareem", bg: "bg-emerald-500", text: "text-white" },
    { name: "Girly", bg: "bg-pink-400", text: "text-white" },
    { name: "Pop Culture", bg: "bg-purple-500", text: "text-white" },
    { name: "K-pop", bg: "bg-rose-500", text: "text-white" },
    { name: "Best for Laptops", bg: "bg-blue-500", text: "text-white" },
    { name: "Best for Phones", bg: "bg-orange-500", text: "text-white" },
    { name: "Others", bg: "bg-zinc-700", text: "text-white" },
];

const StickerThemes = () => {
    return (
        <section id="themes" className="container mx-auto px-4 pt-0 pb-16">
            <h2 className="font-display text-3xl md:text-5xl font-extrabold text-center mb-10">
                Sticker Themes
            </h2>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 max-w-5xl mx-auto">
                {themes.map((theme) => (
                    <Link
                        key={theme.name}
                        href={`/theme/${encodeURIComponent(theme.name)}`}
                        className={`${theme.bg} ${theme.text} px-8 py-4 md:px-12 md:py-5 rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-md cursor-pointer flex-grow sm:flex-grow-0`}
                    >
                        <span className="font-display text-xl md:text-2xl font-bold text-center whitespace-nowrap">
                            {theme.name}
                        </span>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default StickerThemes;
