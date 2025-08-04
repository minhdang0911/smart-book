import Link from 'next/link';
import { getPosts } from '../../lib/getPosts';
import PostSwiper from './PostSwiper';

export default async function PostList() {
    const posts = await getPosts();

    return (
        <section className="post-list-section">
            <div className="container">
                <div className="section-header">
                    {/* <h2 className="section-title">Vietnam Post Logistics Tin tức</h2> */}
                    {/* <div className="section-nav">
                        <Link href="/blog" className="nav-item active">
                            Blog
                        </Link>
                        <Link href="/news" className="nav-item">
                            News
                        </Link>
                        <Link href="/logistics" className="nav-item">
                            Bản tin Viet Nam Logistics
                        </Link>
                    </div> */}
                </div>

                {posts && posts.length > 0 ? (
                    <>
                        <PostSwiper posts={posts} />
                        {/* <div className="section-footer">
                            <Link href="/blog" className="view-all-btn">
                                XEM TẤT CẢ TIN
                            </Link>
                        </div> */}
                    </>
                ) : (
                    <div className="no-posts">
                        <p>Không có bài viết nào để hiển thị.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
