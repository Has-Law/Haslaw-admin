'use client';

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import search from "@/assets/news/search.png";
import icDelete from "@/assets/news/delete.png";
import icEdit from "@/assets/news/edit.png";
import deleteIcon from "@/assets/news/delete-pop.png"; 
import { fetchNewsList, deleteNews, ApiNews } from "@/lib/news";
import { useState, useEffect } from "react";

const CustomNotification = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void; }) => {
    useEffect(() => {
        const timer = setTimeout(() => onClose(), 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const baseClasses = "fixed top-5 right-5 z-[100] p-4 rounded-lg shadow-lg flex items-center transition-transform transform animate-slide-in";
    const typeClasses = type === 'success' ? "bg-green-100 border border-green-400 text-green-800" : "bg-red-100 border border-red-400 text-red-800";

    return (
        <div className={`${baseClasses} ${typeClasses}`} role="alert">
            <span className="font_britanica_bold mr-3">{type === 'success' ? 'Berhasil!' : 'Error!'}</span>
            <span className="font_britanica_regular">{message}</span>
            <button onClick={onClose} className="ml-auto pl-3 text-xl font-bold hover:opacity-70">&times;</button>
        </div>
    );
};

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, isDeleting }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; isDeleting: boolean; }) => {
    return (
        <div 
            className={`fixed inset-0 flex items-center justify-center backdrop-blur-xs z-50 p-4 transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
            <div 
                className={`bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            >
                <Image src={deleteIcon} alt="Delete Icon" width={64} height={64} className="mx-auto mb-6" />
                <h2 className="text-2xl font_britanica_bold text-black mb-2">Delete This News?</h2>
                <p className="text-gray-600 mb-8 font_britanica_regular">
                    This News will be permanently deleted and cannot be recovered
                </p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="px-8 py-3 w-36 rounded-full border border-[#A0001B] text-[#A0001B] font_britanica_bold hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="px-8 py-3 w-36 rounded-full bg-[#A0001B] text-white font_britanica_bold hover:bg-[#800016] transition-colors disabled:opacity-50"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
};


const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
};

const Dashboard = () => {
    const router = useRouter();
    const [newsData, setNewsData] = useState<ApiNews[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newsIdToDelete, setNewsIdToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [notification, setNotification] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ show: true, message, type });
    };

    useEffect(() => {
        const loadNews = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const data = await fetchNewsList();
                setNewsData(data);
            } catch (err) { 
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };
        loadNews();
    }, [refreshTrigger]);

    useEffect(() => {
        const handleFocus = () => setRefreshTrigger(prev => prev + 1);
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, []);

    const handleRefresh = () => setRefreshTrigger(prev => prev + 1);


    const openDeleteModal = (id: number) => {
        setNewsIdToDelete(id);
        setIsModalOpen(true);
    };


    const confirmDelete = async () => {
        if (!newsIdToDelete) return;

        setIsDeleting(true);
        try {
            await deleteNews(newsIdToDelete);
            setNewsData(currentNews => currentNews.filter(news => news.id !== newsIdToDelete));
            showNotification('Berita berhasil dihapus!', 'success');
        } catch (err) { 
            console.error('Error deleting news:', err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            showNotification(`Error menghapus berita: ${errorMessage}`, 'error');
        } finally {
            setIsModalOpen(false);
            setNewsIdToDelete(null);
            setIsDeleting(false);
        }
    };

    const handleEdit = (id: number) => router.push(`/news/edit/${id}`);

    const filteredNews = newsData.filter(news => news.news_title.toLowerCase().includes(searchQuery.toLowerCase()));

    if (isLoading) {
        return (
            <div className="p-4 sm:p-8 rounded-2xl bg-white shadow-lg lg:w-[80vw] min-h-screen flex items-center justify-center">
                <div className="text-xl font_britanica_bold text-gray-600">Memuat data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 sm:p-8 rounded-2xl bg-white shadow-lg lg:w-[80vw] min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-xl font_britanica_bold text-red-600 mb-4">Error: {error}</div>
                    <button onClick={handleRefresh} className="px-4 py-2 bg-[#A0001B] text-white rounded-lg hover:bg-[#800016]">Coba Lagi</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 flex items-center justify-center">
            {notification.show && <CustomNotification message={notification.message} type={notification.type} onClose={() => setNotification({ ...notification, show: false })} />}
            <DeleteConfirmationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={confirmDelete} isDeleting={isDeleting} />

            <div className="p-4 sm:p-8 rounded-2xl bg-white shadow-lg lg:w-[80vw] min-h-screen overflow-y-auto">
                <div className="flex flex-col">
                    <div className="flex flex-row items-center justify-between w-full mb-8 gap-4">
                        <h1 className="font_britanica_bold text-3xl text-black text-nowrap">
                            News and Insight
                        </h1>
                        <div className="flex flex-row items-center gap-4">
                            <div className="relative lg:block hidden">
                                <input
                                    type="text"
                                    placeholder="Cari berdasarkan judul..."
                                    className="border border-[#A0001B] rounded-full px-4 py-2 pr-10 outline-none"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <Image src={search} alt="search icon" className="absolute w-5 h-5 right-4 top-1/2 -translate-y-1/2" />
                            </div>
                            <Link href="/news/add" passHref>
                                <button className="bg-[#A0001B] rounded-lg px-4 py-2 text-white font_britanica_bold hover:bg-[#4F000D] flex items-center gap-2 whitespace-nowrap text-xl cursor-pointer transition-colors">
                                    <span>+</span>
                                    <span>Add News & Insight</span>
                                </button>
                            </Link>
                        </div>
                    </div>
                    {filteredNews.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-500 font_britanica_bold text-lg">
                                {searchQuery ? 'Tidak ada berita yang cocok' : 'Belum ada berita'}
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <div className="min-w-full text-left text-sm whitespace-nowrap mb-6">
                                <div className="font_britanica_bold text-black text-xl">
                                    <div className="flex">
                                        <div className="px-6 py-4 bg-[#F5F5F5] rounded-l-xl w-20">No</div>
                                        <div className="px-6 py-4 bg-[#F5F5F5] flex-1 min-w-[200px]">News Title</div>
                                        <div className="px-6 py-4 bg-[#F5F5F5] flex-1 min-w-[120px]">Date</div>
                                        <div className="px-6 py-4 bg-[#F5F5F5] flex-1 min-w-[200px]">Category</div>
                                        <div className="px-6 py-4 bg-[#F5F5F5] flex-1 min-w-[150px]">Status</div>
                                        <div className="px-6 py-4 bg-[#F5F5F5] rounded-r-xl w-32">Action</div>
                                    </div>
                                </div>
                            </div>
                            <div className="font_britanica_bold space-y-1">
                                {filteredNews.map((item, index) => (
                                    <div key={item.id} className="flex font_britanica_bold">
                                        <div className="px-6 py-4 bg-[#F5F5F5] rounded-l-xl w-20">{index + 1}.</div>
                                        <div className="px-6 py-4 bg-[#F5F5F5] flex-1 min-w-[200px] text-nowrap" title={item.news_title}>
                                            {item.news_title.length > 50 ? item.news_title.substring(0, 50) + '...' : item.news_title}
                                        </div>
                                        <div className="px-6 py-4 bg-[#F5F5F5] flex-1 min-w-[120px] text-nowrap">{formatDate(item.created_at)}</div>
                                        <div className="px-6 py-4 bg-[#F5F5F5] flex-1 min-w-[200px] text-nowrap">{item.category}</div>
                                        <div className="px-6 py-4 bg-[#F5F5F5] flex-1 min-w-[150px]">
                                            <span className={`px-3 py-1.5 text-white font_britanica_bold rounded-md text-base ${item.status === 'Posted' ? 'bg-[#28A745]' : 'bg-[#FD7E14]'}`}>
                                                {item.status === 'Posted' ? 'Posted' : 'Draft'}
                                            </span>
                                        </div>
                                        <div className="px-6 py-2 bg-[#F5F5F5] rounded-r-xl w-32">
                                            <div className="flex items-center gap-4">
                                                <button onClick={() => handleEdit(item.id)} className="hover:opacity-75" title="Edit berita">
                                                    <Image src={icEdit} alt="Edit" className="w-8" />
                                                </button>
                                                <button onClick={() => openDeleteModal(item.id)} className="hover:opacity-75" title="Hapus berita">
                                                    <Image src={icDelete} alt="Delete" className="w-8 " />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;