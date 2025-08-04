// app/bookstore/components/LoadingSkeleton.tsx
'use client';
import { Card, Skeleton } from 'antd';

export function LoadingSkeleton() {
    return (
        <div className="bookstore-container">
            <div className="books-grid">
                {[...Array(10)].map((_, index) => (
                    <div key={index} className="book-grid-item">
                        <Card>
                            <Skeleton.Image style={{ width: '100%', height: 300 }} active />
                            <Skeleton active paragraph={{ rows: 3 }} />
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
}
