function Error({ statusCode }) {
    return (
        <div style={styles.container}>
            <h1 style={styles.heading}>
                {statusCode
                    ? `An error ${statusCode} occurred on server`
                    : 'An error occurred on client'}
            </h1>
            <a href="/" style={styles.link}>Go back home</a>
        </div>
    );
}

Error.getInitialProps = ({ res, err }) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
    return { statusCode };
};

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
    },
    heading: {
        fontSize: '2rem',
        marginBottom: '2rem',
        color: '#333',
    },
    link: {
        color: '#0070f3',
        textDecoration: 'none',
        fontSize: '1.1rem',
    },
};

export default Error; 