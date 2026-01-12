import WizardContainer from '@/components/wizard/WizardContainer'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 w-full max-w-xl mx-auto">
        <WizardContainer />
      </div>
      <Footer />
    </main>
  )
}
