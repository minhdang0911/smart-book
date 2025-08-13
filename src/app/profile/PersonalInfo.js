'use client';

import { CalendarOutlined, EditOutlined, UserOutlined } from '@ant-design/icons';
import {
    Avatar,
    Button,
    Card,
    Col,
    DatePicker,
    Divider,
    Form,
    Input,
    Row,
    Select,
    Space,
    Typography,
    message,
} from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useMemo, useRef, useState } from 'react';

dayjs.extend(customParseFormat);

const { Title, Text } = Typography;

const PHONE_REGEX = /^(0?)(3[2-9]|5[689]|7[06-9]|8[1-5]|9[0-9])[0-9]{7}$/;

export default function PersonalInfo({ user, token, mutateUser }) {
    const [form] = Form.useForm();
    const [editing, setEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);

    const fileRef = useRef(null);
    const handlePickFile = () => fileRef.current?.click();

    const initialDOB = useMemo(() => {
        if (!user?.date_of_birth) return null;
        // user.date_of_birth có thể đã là 'YYYY-MM-DD'
        const parsed = dayjs(user.date_of_birth, ['YYYY-MM-DD', 'DD/MM/YYYY'], true).isValid()
            ? dayjs(user.date_of_birth)
            : null;
        return parsed;
    }, [user?.date_of_birth]);

    const genderOptions = [
        { value: 'male', label: 'Nam' },
        { value: 'female', label: 'Nữ' },
        { value: 'other', label: 'Khác' },
        { value: 'unknown', label: 'Không rõ' },
    ];

    const onFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            message.error('File phải là ảnh.');
            e.target.value = '';
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            message.error('Ảnh tối đa 10MB.');
            e.target.value = '';
            return;
        }
        setAvatarFile(file);
        message.success('Đã chọn ảnh. Nhấn "Cập nhật" để lưu.');
        e.target.value = '';
    };

    const normalizeDOB = (val) => {
        // val có thể là Dayjs hoặc string (khi gõ tay)
        if (!val) return null;
        if (typeof val === 'string') {
            const parsed = dayjs(val, ['DD/MM/YYYY', 'YYYY-MM-DD'], true);
            return parsed.isValid() ? parsed.format('YYYY-MM-DD') : null;
        }
        // Dayjs
        return dayjs(val).format('YYYY-MM-DD');
    };

    const handleFinish = async (values) => {
        // Chuẩn hoá dữ liệu gửi lên
        const payload = {
            name: values.name?.trim(),
            phone: values.phone?.trim() || null,
            date_of_birth: normalizeDOB(values.date_of_birth) || null,
            gender: values.gender || null,
        };

        // FE validate nhẹ nhàng trước khi bắn
        if (!payload.name) {
            form.setFields([{ name: 'name', errors: ['Vui lòng nhập tên.'] }]);
            return;
        }
        if (payload.phone && !PHONE_REGEX.test(payload.phone)) {
            form.setFields([{ name: 'phone', errors: ['Số điện thoại không hợp lệ.'] }]);
            return;
        }
        // Nếu người dùng gõ DOB sai định dạng
        if (values.date_of_birth && !payload.date_of_birth) {
            form.setFields([
                { name: 'date_of_birth', errors: ['Ngày sinh không hợp lệ. Dùng DD/MM/YYYY hoặc YYYY-MM-DD.'] },
            ]);
            return;
        }

        setSubmitting(true);
        try {
            let res;
            if (avatarFile) {
                // multipart/form-data
                const fd = new FormData();
                Object.entries(payload).forEach(([k, v]) => {
                    if (v !== undefined && v !== null && v !== '') fd.append(k, v);
                });
                fd.append('avatar', avatarFile);

                res = await fetch('http://localhost:8000/api/user/profile', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                    },
                    body: fd,
                });
            } else {
                // JSON
                res = await fetch('http://localhost:8000/api/user/profile', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                });
            }

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                // map lỗi Laravel validation 422
                if (res.status === 422 && data?.errors) {
                    const fields = Object.entries(data.errors).map(([name, msgs]) => ({
                        name,
                        errors: Array.isArray(msgs) ? msgs : [String(msgs)],
                    }));
                    form.setFields(fields);
                }
                throw new Error(data?.message || 'Cập nhật thất bại.');
            }

            message.success('Cập nhật thông tin thành công.');
            setEditing(false);
            setAvatarFile(null);

            // Gọi lại hook useUser để cập nhật dữ liệu
            if (mutateUser) {
                await mutateUser();
            }

            // cập nhật lại form theo response (nếu server trả user)
            if (data?.user) {
                form.setFieldsValue({
                    name: data.user.name ?? undefined,
                    phone: data.user.phone ?? undefined,
                    date_of_birth: data.user.date_of_birth ? dayjs(data.user.date_of_birth) : null,
                    gender: data.user.gender ?? undefined,
                });
            }
        } catch (err) {
            message.error(err.message || 'Có lỗi xảy ra.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="page">
            <div className="page-inner">
                {/* Header top: title + avatar (chỉ hiển thị khi editing) */}
                <div className="top-header">
                    <Title level={2} className="page-title">
                        Quản lý thông tin
                    </Title>
                    {/* Chỉ hiển thị phần avatar khi đang editing */}
                    {editing && (
                        <div className="avatar-top">
                            <Avatar
                                size={72}
                                src={
                                    avatarFile
                                        ? URL.createObjectURL(avatarFile)
                                        : user?.avatar_url || user?.avatar || undefined
                                }
                                icon={<UserOutlined />}
                                className="avatar"
                            />
                            <div className="avatar-edit-section">
                                <button
                                    type="button"
                                    className="avatar-edit"
                                    title="Thay ảnh"
                                    aria-label="Thay ảnh"
                                    onClick={handlePickFile}
                                >
                                    <EditOutlined />
                                </button>
                                <span className="avatar-edit-text">Thêm ảnh avatar</span>
                                <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFileChange} />
                            </div>
                        </div>
                    )}
                </div>

                <div className="tabs">
                    <button className="tab active">Thông tin cá nhân</button>
                </div>

                <Card className="panel">
                    <div className="meta">
                        <Space size={8}>
                            <CalendarOutlined />
                            <Text type="secondary">
                                Thành viên từ{' '}
                                {user?.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : '—'}
                            </Text>
                        </Space>
                    </div>

                    <Divider className="divider" />

                    <Form
                        form={form}
                        layout="vertical"
                        requiredMark={false}
                        initialValues={{
                            name: user?.name ?? '',
                            phone: user?.phone ?? '',
                            gender: user?.gender ?? 'unknown',
                            date_of_birth: initialDOB,
                        }}
                        onFinish={handleFinish}
                    >
                        <Row gutter={[16, 16]}>
                            <Col xs={24} md={12}>
                                <Form.Item label="Tên đăng nhập">
                                    <Input
                                        className="field"
                                        value={user?.username || user?.email || ''}
                                        readOnly
                                        disabled
                                    />
                                </Form.Item>
                            </Col>

                            <Col xs={24} md={12}>
                                <Form.Item label="ID người dùng">
                                    <Input className="field" value={user?.id ?? ''} readOnly disabled />
                                </Form.Item>
                            </Col>

                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="phone"
                                    label="Số điện thoại"
                                    rules={[
                                        {
                                            validator: (_, v) => {
                                                if (!v) return Promise.resolve();
                                                return PHONE_REGEX.test(v)
                                                    ? Promise.resolve()
                                                    : Promise.reject(new Error('Số điện thoại không hợp lệ.'));
                                            },
                                        },
                                    ]}
                                >
                                    <Input
                                        className="field"
                                        placeholder="Nhập số điện thoại"
                                        disabled={!editing}
                                        maxLength={11}
                                    />
                                </Form.Item>
                            </Col>

                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="name"
                                    label="Họ và tên"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập tên.' },
                                        { max: 100, message: 'Tên không vượt quá 100 ký tự.' },
                                    ]}
                                >
                                    <Input className="field" placeholder="Nhập họ và tên" disabled={!editing} />
                                </Form.Item>
                            </Col>

                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="date_of_birth"
                                    label="Ngày sinh"
                                    tooltip="Có thể chọn lịch hoặc gõ DD/MM/YYYY hoặc YYYY-MM-DD"
                                    rules={[
                                        {
                                            validator: (_, v) => {
                                                if (!v) return Promise.resolve(); // optional
                                                // v có thể là Dayjs (nếu chọn) hoặc string (nếu gõ)
                                                if (dayjs.isDayjs(v)) return Promise.resolve();
                                                const ok = dayjs(
                                                    String(v),
                                                    ['DD/MM/YYYY', 'YYYY-MM-DD'],
                                                    true,
                                                ).isValid();
                                                return ok
                                                    ? Promise.resolve()
                                                    : Promise.reject(new Error('Ngày sinh không hợp lệ.'));
                                            },
                                        },
                                    ]}
                                >
                                    <DatePicker
                                        className="field"
                                        style={{ width: '100%' }}
                                        disabled={!editing}
                                        format="DD/MM/YYYY"
                                        inputReadOnly={false}
                                        allowClear
                                        onChange={(date, dateString) => {
                                            // Cho phép gõ tay nhiều định dạng
                                            if (!date && dateString) {
                                                const parsed = dayjs(dateString, ['DD/MM/YYYY', 'YYYY-MM-DD'], true);
                                                form.setFieldsValue({
                                                    date_of_birth: parsed.isValid() ? parsed : null,
                                                });
                                            }
                                        }}
                                    />
                                </Form.Item>
                            </Col>

                            <Col xs={24} md={12}>
                                <Form.Item name="gender" label="Giới tính">
                                    <Select
                                        className="field"
                                        disabled={!editing}
                                        options={genderOptions}
                                        showSearch
                                        optionFilterProp="label"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <div className="actions">
                            {editing ? (
                                <>
                                    <Button
                                        size="large"
                                        onClick={() => {
                                            setEditing(false);
                                            setAvatarFile(null);
                                            form.resetFields();
                                        }}
                                    >
                                        Hủy
                                    </Button>
                                    <Button
                                        type="primary"
                                        size="large"
                                        icon={<EditOutlined />}
                                        loading={submitting}
                                        htmlType="submit"
                                    >
                                        Cập nhật
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<EditOutlined />}
                                    onClick={() => setEditing(true)}
                                >
                                    Chỉnh sửa thông tin
                                </Button>
                            )}
                        </div>
                    </Form>
                </Card>
            </div>

            <style jsx>{`
                .page {
                    --ink: #111;
                    --muted: #6f6f6f;
                    --line: #e9e9e9;
                    --card: #fff;
                    --radius: 14px;
                    background: transparent;
                    min-height: 100vh;
                    padding: 40px 24px;
                    color: var(--ink);
                }
                .page-inner {
                    max-width: 980px;
                    margin: 0 auto;
                }

                .top-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 14px;
                    min-height: 72px;
                }
                .page-title {
                    margin: 0;
                    font-weight: 800;
                }

                .avatar-top {
                    position: relative;
                    width: 150px;
                    height: 100px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .avatar-edit-section {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin-top: 8px;
                }

                .avatar-edit {
                    position: absolute;
                    right: -6px;
                    bottom: -6px;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    display: grid;
                    place-items: center;
                    background: #111;
                    color: #fff;
                    border: 1px solid #fff;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
                    cursor: pointer;
                    transition: transform 0.12s ease, opacity 0.12s ease;
                }
                .avatar-edit:hover {
                    transform: translateY(-1px);
                    opacity: 0.95;
                }

                .avatar-edit-text {
                    font-size: 12px;
                    color: var(--muted);
                    margin-top: 4px;
                    text-align: center;
                    white-space: nowrap;
                }

                .tabs {
                    display: flex;
                    gap: 8px;
                    border-bottom: 1px solid var(--line);
                    margin-bottom: 18px;
                }
                .tab {
                    background: transparent;
                    border: 0;
                    color: var(--muted);
                    padding: 10px 14px;
                    font-weight: 600;
                }
                .tab.active {
                    color: var(--ink);
                    border-bottom: 2px solid var(--ink);
                }

                .panel {
                    background: var(--card);
                    border: 1px solid var(--line);
                    border-radius: var(--radius);
                    padding-top: 12px;
                }
                .divider {
                    margin: 12px 0;
                }

                :global(.field.ant-input),
                :global(.field.ant-picker),
                :global(.field.ant-select) {
                    background: #fff !important;
                    border: 1px solid var(--line) !important;
                    border-radius: 12px !important;
                    height: 44px;
                }
                .actions {
                    margin-top: 18px;
                    display: flex;
                    gap: 10px;
                }
            `}</style>
        </div>
    );
}
