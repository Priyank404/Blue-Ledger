import DashboardLayout from '../layouts/DashboardLayout'

const Settings = () => {
  return (
    <DashboardLayout>
      <div className="screen">
        <section className="screen-head">
          <div>
            <p className="eyebrow">System</p>
            <h1 className="screen-title">Settings</h1>
            <p className="screen-copy">Configuration surface reserved for future portfolio controls.</p>
          </div>
        </section>
        <section className="tile tile-pad">
          <div className="empty">No settings are active in this build.</div>
        </section>
      </div>
    </DashboardLayout>
  )
}

export default Settings
