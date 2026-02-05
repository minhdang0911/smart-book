import VoyageSliderClient from './VoyageSliderClient';

export default async function VoyageSlider() {
    let banners = [];
    try {
<<<<<<< HEAD
        const res = await fetch('https://data-smartbook.gamer.gd/api/banners/get', {
            headers: {
                Accept: 'application/json',
                'User-Agent': 'Mozilla/5.0',
            },
            next: { revalidate: 60 },
=======
        const res = await fetch('http://localhost:8000/api/banners/get', {
            cache: 'no-store',
>>>>>>> b236b22 (up group order)
        });

        console.log('banner', banner);
        const data = await res.json();

        if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
            banners = data.data
                .filter((b) => {
                    return String(b.status) === '1' || b.status === '1';
                })
                .sort((a, b) => (parseInt(a.priority) || 999) - (parseInt(b.priority) || 999));
        }
    } catch (e) {
        console.error('Error fetching banners:', e);
    }

    return <VoyageSliderClient banners={banners} />;
}
