'use client';
import { CopyOutlined, LinkOutlined } from '@ant-design/icons';
import { Button, Input, Modal, Typography, message } from 'antd';

const { Text } = Typography;

export type GroupData = {
    join_url: string;
    group: {
        id: number;
        join_token: string;
        allow_guest: boolean;
        shipping_rule: 'equal' | 'by_value' | 'owner_only';
        expires_at: string;
        created_at: string;
        updated_at: string;
        owner_user_id: number;
    };
};

interface Props {
    open: boolean;
    onClose: () => void;
    data?: GroupData | null;
}

export default function GroupInviteModal({ open, onClose, data }: Props) {
    const handleCopy = async () => {
        if (!data?.join_url) return;
        try {
            await navigator.clipboard.writeText(data.join_url);
            message.success('Đã copy đường link!');
        } catch {
            message.error('Không thể copy đường link');
        }
    };

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <LinkOutlined style={{ color: '#1890ff' }} />
                    <span>Tạo giỏ hàng nhóm thành công!</span>
                </div>
            }
            open={open}
            onCancel={onClose}
            footer={[
                <Button key="copy" icon={<CopyOutlined />} onClick={handleCopy}>
                    Copy Link
                </Button>,
                <Button key="close" onClick={onClose}>
                    Đóng
                </Button>,
            ]}
            width={600}
        >
            {data ? (
                <div style={{ padding: '16px 0' }}>
                    <div style={{ marginBottom: 20 }}>
                        <Text strong style={{ fontSize: 16, color: '#52c41a' }}>
                            Giỏ hàng nhóm đã được tạo thành công!
                        </Text>
                        <p style={{ marginTop: 8, color: '#666' }}>
                            Chia sẻ đường link dưới đây để mời bạn bè cùng mua hàng:
                        </p>
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <Text strong>Đường link tham gia:</Text>
                        <Input.TextArea
                            value={data.join_url}
                            readOnly
                            rows={2}
                            style={{
                                marginTop: 8,
                                backgroundColor: '#f6ffed',
                                border: '1px solid #b7eb8f',
                            }}
                        />
                    </div>

                    <div style={{ backgroundColor: '#f0f8ff', padding: 12, borderRadius: 6 }}>
                        <Text strong>Thông tin giỏ hàng nhóm:</Text>
                        <div style={{ marginTop: 8, lineHeight: 1.6 }}>
                            <p>
                                <Text type="secondary">ID nhóm:</Text> <Text code>#{data.group.id}</Text>
                            </p>
                            <p>
                                <Text type="secondary">Mã tham gia:</Text> <Text code>{data.group.join_token}</Text>
                            </p>
                            <p>
                                <Text type="secondary">Cho phép khách:</Text>{' '}
                                <Text>{data.group.allow_guest ? 'Có' : 'Không'}</Text>
                            </p>
                            <p>
                                <Text type="secondary">Quy tắc vận chuyển:</Text>{' '}
                                <Text>
                                    {data.group.shipping_rule === 'equal'
                                        ? 'Chia đều'
                                        : data.group.shipping_rule === 'by_value'
                                        ? 'Theo tỷ lệ giá trị'
                                        : 'Chủ phòng trả ship'}
                                </Text>
                            </p>
                            <p>
                                <Text type="secondary">Hết hạn:</Text>{' '}
                                <Text>{new Date(data.group.expires_at).toLocaleString('vi-VN')}</Text>
                            </p>
                        </div>
                    </div>

                    <div
                        style={{
                            marginTop: 16,
                            padding: 12,
                            backgroundColor: '#fff7e6',
                            borderRadius: 6,
                            border: '1px solid #ffd666',
                        }}
                    >
                        <Text style={{ fontSize: 14, color: '#d46b08' }}>
                            💡 <strong>Lưu ý:</strong> Link sẽ hết hạn vào{' '}
                            {new Date(data.group.expires_at).toLocaleString('vi-VN')}. Hãy chia sẻ ngay với bạn bè!
                        </Text>
                    </div>
                </div>
            ) : (
                <Text type="secondary">Không có dữ liệu nhóm để hiển thị.</Text>
            )}
        </Modal>
    );
}
