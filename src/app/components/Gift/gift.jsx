'use client';
import { useState } from 'react';

export default function NewsletterSignup() {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = () => {
        if (email) {
            setIsSubmitted(true);
            setTimeout(() => {
                setIsSubmitted(false);
                setEmail('');
            }, 3000);
        }
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                {/* Content Section */}
                <div style={styles.contentSection}>
                    <div style={styles.contentWrapper}>
                        <div style={styles.badge}>BẢN TIN</div>

                        <h1 style={styles.title}>Đăng ký và nhận giảm giá 10%</h1>

                        <p style={styles.description}>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec
                            ullamcorper mattis, pulvinar dapibus leo.
                        </p>

                        <div style={styles.formContainer}>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email..."
                                style={styles.input}
                            />

                            <button
                                onClick={handleSubmit}
                                style={isSubmitted ? { ...styles.button, ...styles.buttonSuccess } : styles.button}
                                disabled={isSubmitted}
                            >
                                {isSubmitted ? '✓ Đã đăng ký!' : 'Đăng ký'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Image Section */}
                <div style={styles.imageSection}>
                    <div style={styles.imageWrapper}>
                        {/* Simulated person */}
                        <div style={styles.personSilhouette}></div>

                        {/* Kitchen elements */}
                        <div style={styles.kitchenElement1}></div>
                        <div style={styles.kitchenElement2}></div>
                        <div style={styles.kitchenElement3}></div>
                    </div>
                </div>

                {/* Success message */}
                {isSubmitted && <div style={styles.successMessage}>🎉 Cảm ơn bạn đã đăng ký!</div>}
            </div>
        </div>
    );
}

const styles = {
    wrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        padding: '2rem',
    },

    container: {
        display: 'flex',
        width: '80%',
        height: '300px',
        borderRadius: '16px',
        overflow: 'hidden',
        backgroundColor: 'white',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },

    contentSection: {
        flex: 1,
        backgroundColor: 'white',
        display: 'flex',
        alignItems: 'center',
        padding: '0 3rem',
    },

    contentWrapper: {
        width: '100%',
    },

    badge: {
        display: 'inline-block',
        backgroundColor: '#1f2937',
        color: 'white',
        padding: '0.5rem 1rem',
        fontSize: '0.875rem',
        fontWeight: '500',
        borderRadius: '4px',
        marginBottom: '1.5rem',
        letterSpacing: '0.5px',
    },

    title: {
        fontSize: '2.5rem',
        fontWeight: 'bold',
        color: '#1f2937',
        lineHeight: '1.2',
        marginBottom: '1rem',
    },

    description: {
        color: '#6b7280',
        fontSize: '1rem',
        lineHeight: '1.6',
        marginBottom: '2rem',
    },

    formContainer: {
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'center',
    },

    input: {
        flex: 1,
        padding: '0.75rem 1rem',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '1rem',
        outline: 'none',
        transition: 'border-color 0.3s ease',
    },

    button: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#2563eb',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '1rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
        whiteSpace: 'nowrap',
    },

    buttonSuccess: {
        backgroundColor: '#10b981',
    },

    imageSection: {
        flex: 1,
        background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
        position: 'relative',
        overflow: 'hidden',
    },

    imageWrapper: {
        width: '100%',
        height: '100%',
        position: 'relative',
        background: 'linear-gradient(135deg, #bfdbfe 0%, #c7d2fe 100%)',
    },

    personSilhouette: {
        position: 'absolute',
        bottom: '0',
        right: '25%',
        width: '16rem',
        height: '24rem',
        background: 'linear-gradient(to top, rgba(31, 41, 55, 0.2), rgba(75, 85, 99, 0.1))',
        borderTopLeftRadius: '50%',
        borderTopRightRadius: '50%',
    },

    kitchenElement1: {
        position: 'absolute',
        top: '25%',
        left: '25%',
        width: '8rem',
        height: '4rem',
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },

    kitchenElement2: {
        position: 'absolute',
        top: '33%',
        right: '33%',
        width: '6rem',
        height: '3rem',
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },

    kitchenElement3: {
        position: 'absolute',
        bottom: '33%',
        left: '17%',
        width: '5rem',
        height: '5rem',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: '50%',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },

    successMessage: {
        position: 'fixed',
        top: '2rem',
        right: '2rem',
        backgroundColor: '#10b981',
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        fontSize: '0.875rem',
        fontWeight: '500',
    },
};
