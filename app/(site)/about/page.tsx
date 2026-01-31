export default function AboutPage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-[#D4AF37]/30">
            <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Hero Section */}
                    <div className="text-center mb-16 space-y-4">
                        <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-[#D4AF37]">
                            About Tirhuta
                        </h1>
                        <h2 className="text-2xl md:text-3xl font-serif text-white/90">
                            तिरहुता के बारे में
                        </h2>
                        <div className="w-24 h-1 bg-[#D4AF37] mx-auto rounded-full mt-8 opacity-50"></div>
                    </div>

                    {/* Main Content */}
                    <div className="space-y-12 text-lg md:text-xl leading-relaxed font-light text-gray-300">
                        {/* Hindi/Maithili Section */}
                        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm">
                            <h3 className="text-[#D4AF37] font-serif mb-4 text-2xl font-semibold">मैथिली एवं मिथिला</h3>
                            <p className="mb-6">
                                <span className="text-[#D4AF37] font-bold">तिरहुता</span> - यह एक ऐसा प्लेटफार्म है जो पूरी तरह से मैथिलि एवं मिथिला के लिये पुर्णतः समर्पित है। यह वेबपेज, प्लेस्टोर एवं एप्पलस्टोर पर स्थापित है। यहाँ सभी सामग्री मूलतः मैथिलि भाषा के लिए है, परन्तु अंगीका, मगही, खोरठा, भोजपुरी, हिंदी एवं अन्य भाषा की सामग्री को भी जगह देती है। इसके अलाबा अन्य भाषाओं की सामग्री भी आप सभी दर्सकों की चाहत पर निर्भर करती है।
                            </p>
                            <p>
                                यहाँ मैथिलि भाषा में सभी विधाओं के फिल्म, धारावाहिक, गीत संगीत, अल्पवधी फिल्म, वेबसीरिज़, खेलकूद, मिथिला समाचार, साहित्य एवं संस्कृति, कवि गोष्ठी, अनन्य सम्पूर्ण मिथिला के पारम्परिक, सांस्कृतिक एवं व्यवहारिक कार्यक्रम, अनेकों स्पर्धात्मक कार्यक्रम, मनोरंजन के सभी विधाओं का समागम, तथा समस्त मिथिला की समस्या समाधान पर उन्नत वार्तालाप, इन सभी विषयों एवं कलात्मक स्वरुपों को तिरहुता अपने मे जगह देती है।
                            </p>
                        </div>

                        {/* English Section */}
                        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm">
                            <h3 className="text-[#D4AF37] font-serif mb-4 text-2xl font-semibold">Maithili & Mithila</h3>
                            <p className="mb-6">
                                <span className="text-[#D4AF37] font-bold">Tirhuta</span> - is a platform completely dedicated to Maithili and Mithila. It is available on Web, Play Store, and Apple Store. While the primary content is in Maithili, it also provides space for content in Angika, Magahi, Khortha, Bhojpuri, Hindi, and other languages. Additionally, content in other languages also depends on the desires of our viewers.
                            </p>
                            <p>
                                Tirhuta hosts all genres of content in Maithili, including films, serials, songs and music, short films, web series, sports, Mithila news, literature and culture, poet meets (Kavi Goshti), traditional, cultural, and practical programs of entire Mithila, numerous competitive programs, a confluence of all entertainment genres, and advanced conversations on problem-solving for all of Mithila. Tirhuta accommodates all these subjects and artistic forms.
                            </p>
                        </div>

                        <div className="text-center py-12 border-y border-white/10">
                            <blockquote className="text-2xl md:text-4xl font-serif italic text-white leading-snug">
                                “तिरहुता”<br />
                                ब्रम्हांड मंत्राकी <br />
                                एक अनोखी पहल है।<br />
                                <span className="text-[#D4AF37] font-semibold not-italic text-xl md:text-2xl mt-4 block">
                                    जो संपूर्णतः मिथिला एवं मैथिली के लिये समर्पित है।
                                </span>
                            </blockquote>
                            <div className="mt-8 text-white/50 text-base md:text-lg">
                                &mdash; A unique initiative by Brahmand Mantra, <br />
                                entirely dedicated to Mithila and Maithili.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
