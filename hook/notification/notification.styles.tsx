import { createStyles } from 'antd-style';
//Chỉ chứa CSS styling cho các popup thông báo, sử dụng thư viện antd-style
export const useNotificationStyles = createStyles(({ token }) => ({
    // notification: {
    //     padding: "10px 12px"
    // },
    wrapper: {
        padding: 0
    },
    base: {
        borderRadius: 12,
        boxShadow: '0 2px 2px rgba(0,0,0,0.02)',
    },
    content: {
        width: "100%",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'start',
        gap: 12,
        fontSize: 14,
        color: token.colorText,
        whiteSpace: 'pre-line',
    },

    success: {
        borderLeft: `3px solid ${token.colorSuccess}`,
        borderBottom: `1px solid ${token.colorSuccess}`,

    },
    error: {
        borderLeft: `3px solid ${token.colorError}`,
        borderBottom: `1px solid ${token.colorError}`,
    },

    warning: {
        borderLeft: `3px solid ${token.colorWarning}`,
        borderBottom: `1px solid ${token.colorWarning}`,
    },

    icon: {
        fontSize: 16,
        marginTop: 2, // Align icon with the first line of text
    },
}));
