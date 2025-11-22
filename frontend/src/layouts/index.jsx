import Header from "../components/header";
import ClientMain from "../components/main";
import Footer from "../components/footer";

// Layout component that includes the Header
function Layout() {
  return (
    <div
      className="layout"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Header />
      <div className="content" style={{ flex: 1 }}>
        <ClientMain />
      </div>
      <Footer />
    </div>
  )
}

export default Layout;
