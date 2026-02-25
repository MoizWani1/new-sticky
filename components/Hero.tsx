const Hero = () => {
    return (
        <section className="container mx-auto px-4 py-0 md:py-2 text-center relative overflow-hidden">
            {/* Floating stickers */}
            <img src="/images/sticker-shiba.png" alt="" className="absolute top-4 left-4 w-16 md:w-24 animate-float opacity-60 pointer-events-none" />
            <img src="/images/sticker-gameboy.png" alt="" className="absolute top-12 right-8 w-14 md:w-20 animate-wiggle opacity-60 pointer-events-none" />
            <img src="/images/sticker-anime.png" alt="" className="absolute bottom-8 left-12 w-12 md:w-16 animate-float opacity-50 pointer-events-none" style={{ animationDelay: '1s' }} />

            <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-4 mt-2">
                Stick 'Em Up!<br />
                Your World, <span className="text-primary">Decal-ed.</span>
            </h2>
        </section>
    );
};

export default Hero;
