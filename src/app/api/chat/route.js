'use server';

import { NextResponse } from 'next/server';

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const API_BASE = process.env.SMARTBOOK_API_BASE;

const normalize = (t = '') =>
    t
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

const detectIntent = (text) => {
    const t = normalize(text);

    if (/buon|chan|met|stress|that vong|co don/.test(t)) return 'EMOTION';
    if (/goi y|nen doc|phu hop|tu van/.test(t)) return 'RECOMMEND';
    if (/gia|duoi|tren|khoang|k/.test(t)) return 'PRICE';
    if (/tac gia|author|viet boi/.test(t)) return 'AUTHOR';
    if (/the loai|genre|trinh tham|ngon tinh|tam ly/.test(t)) return 'CATEGORY';
    if (/co khong|tim sach|ten sach/.test(t)) return 'SEARCH';

    return 'FREE';
};

async function fetchData() {
    const [b, a, c] = await Promise.all([
        fetch(`https://smartbook-backend.tranminhdang.cloud/api/books`).then((r) => r.json()),
        fetch(`https://smartbook-backend.tranminhdang.cloud/api/authors`).then((r) => r.json()),
        fetch(`https://smartbook-backend.tranminhdang.cloud/api/categories`).then((r) => r.json()),
    ]);

    return {
        books: b?.top_rated_books || [],
        authors: a?.data || [],
        categories: c?.data || [],
    };
}

function buildSystemPrompt(intent, data) {
    return `
Bạn là SmartBook AI 🤖📚 – một người tư vấn sách cực kỳ thông minh và giàu cảm xúc.

TÍNH CÁCH:
- Nói chuyện tự nhiên như người thật
- Hiểu cả câu hỏi KHÔNG DẤU
- Hiểu cảm xúc người dùng
- Không bao giờ trả lời máy móc hay liệt kê vô hồn

NGUYÊN TẮC:
- Nếu user buồn → an ủi trước, gợi ý sách sau
- Nếu user hỏi mơ hồ → đoán ý + gợi ý
- Nếu không có sách đúng → đề xuất sách TƯƠNG TỰ
- Không bao giờ nói “tôi không biết”

INTENT HIỆN TẠI: ${intent}

DỮ LIỆU (chỉ dùng nếu cần):
Sách: ${data.books
        .slice(0, 10)
        .map((b) => b.title)
        .join(', ')}
Tác giả: ${data.authors
        .slice(0, 5)
        .map((a) => a.name)
        .join(', ')}
Thể loại: ${data.categories.map((c) => c.name).join(', ')}

LUÔN KẾT THÚC BẰNG CÂU HỎI NHẸ NHÀNG.
`;
}

async function callGemini(systemPrompt, userMessage) {
    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCSqb02sLPM0OtKA--myMvi9B6WoB2V_VE`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: systemPrompt }, { text: `Người dùng: ${userMessage}` }],
                    },
                ],
                generationConfig: {
                    temperature: 0.95,
                    maxOutputTokens: 800,
                },
            }),
        },
    );

    const json = await res.json();
    return json?.candidates?.[0]?.content?.parts?.[0]?.text;
}

export async function POST(req) {
    try {
        const { message } = await req.json();
        const intent = detectIntent(message);

        const needData = intent !== 'FREE';
        const data = needData ? await fetchData() : { books: [], authors: [], categories: [] };

        const systemPrompt = buildSystemPrompt(intent, data);
        const answer = await callGemini(systemPrompt, message);

        return NextResponse.json({ reply: answer });
    } catch (e) {
        return NextResponse.json({
            reply: '😅 Mình hơi lag xíu, nhưng vẫn ở đây với bạn nè. Thử nói lại nhé!',
        });
    }
}
