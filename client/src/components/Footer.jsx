const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <p>
          © {new Date().getFullYear()} <a href="/">PizzaByte</a> — Built with 🍕 and ❤️
        </p>
      </div>
    </footer>
  );
};

export default Footer;
