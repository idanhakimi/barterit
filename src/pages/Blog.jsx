import React, { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import blogData from '../components/blogData';

// Public Header for Blog Page
const BlogHeader = () => (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg shadow-sm">
        <div className="container mx-auto px-4">
            <div className="flex justify-between items-center py-4">
                <Link to={createPageUrl("Home")} className="flex items-center gap-3">
                    <img 
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/barterim-logo.png" 
                        alt="BARTERIM Logo" 
                        className="w-10 h-10 object-contain"
                    />
                    <div>
                        <h1 className="text-lg font-bold gradient-text">BARTERIM</h1>
                    </div>
                </Link>
                <nav className="flex items-center gap-8">
                    <Link to={createPageUrl("Home")} className="text-gray-600 hover:text-orange-500 transition-colors duration-300 font-medium">חזרה לאתר הראשי</Link>
                </nav>
            </div>
        </div>
    </header>
);

export default function Blog() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredPosts, setFilteredPosts] = useState(blogData);

    // SEO: Update document title and meta for blog page
    useEffect(() => {
        document.title = 'בלוג BARTERIM - מדריכים וטיפים לברטרים וחילופי שירותים בישראל';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', 'כל מה שצריך לדעת על ברטרים, חילופי שירותים וכלכלת שיתוף. מדריכים, טיפים וסיפורים מעולם הברטרים הדיגיטליים בישראל.');
        }
    }, []);

    useEffect(() => {
        const lowercasedFilter = searchTerm.toLowerCase();
        const filtered = blogData.filter(post =>
            post.title.toLowerCase().includes(lowercasedFilter) ||
            post.summary.toLowerCase().includes(lowercasedFilter)
        );
        setFilteredPosts(filtered);
    }, [searchTerm]);

    return (
        <div className="bg-gray-50 min-h-screen">
            <BlogHeader />
            <div className="container mx-auto px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl font-bold text-center mb-4">הבלוג של BARTERIM - מדריך ברטרים וחילופי שירותים</h1>
                    <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
                        כל מה שצריך לדעת על כלכלת שיתוף, ברטרים בישראל, חילופי שירותים ואיך למנף את הכישרונות שלכם בברטר.
                    </p>
                    <div className="relative max-w-lg mx-auto mb-12">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                            type="text"
                            placeholder="חיפוש מאמרים..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pr-10"
                        />
                    </div>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPosts.map((post, index) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <Link to={createPageUrl(`BlogPost?id=${post.id}`)}>
                                <Card className="h-full overflow-hidden group hover:shadow-xl transition-shadow duration-300">
                                    <div className="overflow-hidden">
                                        <img src={post.image} alt={post.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                                    </div>
                                    <CardHeader>
                                        <CardTitle>{post.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-600 mb-4">{post.summary}</p>
                                        <div className="flex items-center text-orange-500 font-semibold">
                                            קרא עוד <ArrowLeft className="w-4 h-4 mr-2" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>
                {filteredPosts.length === 0 && (
                    <div className="text-center py-16">
                        <p className="text-gray-600">לא נמצאו מאמרים התואמים לחיפוש שלך.</p>
                    </div>
                )}
            </div>
        </div>
    );
}