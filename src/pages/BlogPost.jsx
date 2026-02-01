import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import blogData from '../components/blogData';

// Public Header for Blog Post Page
const BlogHeader = () => (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg shadow-sm">
        <div className="container mx-auto px-4">
            <div className="flex justify-between items-center py-4">
                <Link to={createPageUrl("Home")} className="flex items-center gap-3">
                    <img 
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/2139342b7_barter4u.png" 
                        alt="Barter4U Logo" 
                        className="w-10 h-10 object-contain"
                    />
                </Link>
                <nav className="flex items-center gap-8">
                    <Link to={createPageUrl("Blog")} className="text-gray-600 hover:text-orange-500 transition-colors duration-300 font-medium flex items-center gap-2">
                        <ArrowRight className="w-4 h-4"/>
                        חזרה לכל המאמרים
                    </Link>
                </nav>
            </div>
        </div>
    </header>
);

export default function BlogPost() {
    const [post, setPost] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const postId = params.get('id');
        const foundPost = blogData.find(p => p.id === postId);
        setPost(foundPost);
    }, [location]);

    if (!post) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p>טוען מאמר...</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <BlogHeader />
            <div className="container mx-auto px-4 py-12">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
                    <Card className="overflow-hidden">
                        <img src={post.image} alt={post.title} className="w-full h-64 md:h-96 object-cover" />
                        <CardContent className="p-6 md:p-10">
                            <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
                            <div className="text-sm text-gray-500 mb-6">
                                <span>פורסם בתאריך: {post.date}</span>
                            </div>
                            <div className="prose max-w-none text-right" dangerouslySetInnerHTML={{ __html: post.content }} />
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}