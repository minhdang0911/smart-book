'use client';

import Link from 'next/link';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

export default function VoyageSliderClient({ banners }) {
    console.log('Client banners received:', banners);
    console.log('Banners length:', banners?.length);
    console.log('Banners type:', typeof banners);

    if (!banners || banners.length === 0) {
        return (
            <div
                style={{
                    height: '500px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f5f5f5',
                    flexDirection: 'column',
                }}
            >
                <p>Không có banner để hiển thị</p>
                <p style={{ fontSize: '12px', color: '#666' }}>Debug: banners = {JSON.stringify(banners)}</p>
            </div>
        );
    }

    return (
        <Swiper
            modules={[Navigation, Pagination, Autoplay, EffectFade]}
            effect="fade"
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            loop
            navigation
            pagination={{ clickable: true }}
            style={{ width: '100%', height: '500px' }}
        >
            {banners.map((banner, index) => (
                <SwiperSlide key={banner.id || index}>
                    <div
                        style={{
                            backgroundImage: `url(${banner.image})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            height: '100%',
                        }}
                    >
                        <div
                            style={{
                                background: 'rgba(0,0,0,0.5)',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                textAlign: 'center',
                                padding: '20px',
                            }}
                        >
                            <div>
                                <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{banner.title}</h1>
                                <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>{banner.description}</p>
                                {banner.book_id && (
                                    <Link
                                        href={`/book/${banner.book_id}`}
                                        style={{
                                            backgroundColor: '#007bff',
                                            color: 'white',
                                            padding: '10px 20px',
                                            textDecoration: 'none',
                                            borderRadius: '5px',
                                            display: 'inline-block',
                                        }}
                                    >
                                        Xem chi tiết
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </SwiperSlide>
            ))}
        </Swiper>
    );
}
