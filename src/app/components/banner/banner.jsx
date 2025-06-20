'use client'

import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import './banner.css'

const bannerContent = [
  {
    title: 'Khám Phá Thế Giới Sách',
    description: 'Hành trình tri thức bắt đầu từ đây. Khám phá hàng nghìn cuốn sách hay.',
  },
  {
    title: 'Ưu Đãi Đặc Biệt',
    description: 'Giảm giá lên đến 50% cho tất cả sách bestseller. Cơ hội không thể bỏ lỡ!',
  },
  {
    title: 'Sách Mới Nhất 2025',
    description: 'Cập nhật những cuốn sách mới nhất và được yêu thích nhất năm 2025.',
  },
  {
    title: 'Đọc Sách Online',
    description: 'Trải nghiệm đọc sách trực tuyến với công nghệ hiện đại và tiện lợi.',
  },
  {
    title: 'Cộng Đồng Yêu Sách',
    description: 'Tham gia cộng đồng những người yêu sách và chia sẻ niềm đam mê đọc.',
  }
]

const BannerSlider = () => {
  const [banners, setBanners] = useState([])
  const [activeIndex, setActiveIndex] = useState(0)
  const panelsRef = useRef([])
  const intervalRef = useRef(null)

  useEffect(() => {
    fetch('http://localhost:8000/api/banners')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setBanners(data.data)
        }
      })
  }, [])

  useEffect(() => {
    if (!banners.length) return
    panelsRef.current = panelsRef.current.slice(0, banners.length)

    banners.forEach((_, index) => {
      gsap.set(panelsRef.current[index], {
        flex: index === activeIndex ? 4 : 1
      })
    })
  }, [banners])

  useEffect(() => {
    if (!banners.length) return

    const animatePanels = () => {
      panelsRef.current.forEach((panel, i) => {
        gsap.to(panel, {
          flex: i === activeIndex ? 4 : 1,
          duration: 0.8,
          ease: 'power2.inOut'
        })
      })
    }

    animatePanels()

    intervalRef.current = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % banners.length)
    }, 3000)

    return () => clearInterval(intervalRef.current)
  }, [activeIndex, banners])

  const handleClick = (index) => {
    clearInterval(intervalRef.current) // reset autoplay on manual click
    setActiveIndex(index)
  }

  return (
    <div className="accordion-container">
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`accordion-panel ${activeIndex === index ? 'active' : ''}`}
          ref={el => panelsRef.current[index] = el}
          onClick={() => handleClick(index)}
        >
          <img src={banner.link} alt={bannerContent[index]?.title || `Banner ${index + 1}`} />
          <div className="slide-overlay">
            <h2 className="slide-title">{bannerContent[index]?.title || 'Tiêu đề'}</h2>
            <p className="slide-description">{bannerContent[index]?.description || ''}</p>
            <a
              href={banner.link}
              className="slide-button"
              target="_blank"
              rel="noopener noreferrer"
            >
              Xem Chi Tiết
            </a>
          </div>
        </div>
      ))}
    </div>
  )
}

export default BannerSlider
