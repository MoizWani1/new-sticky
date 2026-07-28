const images = [
    "/images/wild-1.png",
    "/images/wild-2.png",
    "/images/wild-3.png",
    "/images/wild-4.png",
];

const InTheWild = () => {
    return (
        <section className="container mx-auto px-4 py-16">
            <h2 className="font-display text-3xl md:text-5xl font-extrabold text-center mb-10">
                StickyBits in the Wild
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {[...images, ...images].map((src, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-xl hover:scale-[1.03] transition-all">
                        <img src={src} alt="Stickers in use" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                ))}
            </div>
        </section>
    );
};

export default InTheWild;
