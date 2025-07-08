// app/blog/[slug]/page.jsx
'use client';

import PostDetail from '../PostDetail';
import './PostDetailPage.css'; // Import CSS file

const PostDetailPage = ({ params }) => {
    const { slug } = params;

    const handleBack = () => {
        window.history.back();
    };

    return (
        <div className="post-detail-page">
            <div className="post-detail-wrapper">
                <div className="post-detail-header">
                    <button className="back-button" onClick={handleBack}>
                        Quay lại
                    </button>
                </div>
                <div className="post-detail-content">
                    <PostDetail slug={slug} onBack={handleBack} />
                </div>
            </div>
        </div>
    );
};

export default PostDetailPage;