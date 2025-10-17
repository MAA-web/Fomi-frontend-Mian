import Header from "@/components/layout/Header"
import InpaintInputControls from "@/components/pages/inpaint/InpaintInputControls"
import InpaintCanvas from "@/components/pages/inpaint/InpaintCanvas"


export default function InpaintPage() {
  return (
    <div className="min-h-screen bg-[#fbfaf7] px-10 relative">
      <Header />

      <div className="flex gap-6 pt-6">
        <InpaintInputControls />
        <InpaintCanvas />
      </div>

  
    </div>
  )
}
